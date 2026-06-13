import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config/env';

// ── Custom errors ─────────────────────────────────────────────────────────────

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly original: string,
    public readonly repaired: string | null,
    public readonly zodErrors: z.ZodError | null
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ── NIM client singleton ──────────────────────────────────────────────────────

let _nimClient: OpenAI | null = null;

function getNimClient(): OpenAI {
  if (!_nimClient) {
    _nimClient = new OpenAI({
      baseURL: env.NIM_BASE_URL,
      apiKey: env.NVIDIA_NIM_API_KEY,
    });
  }
  return _nimClient;
}

// ── Layer 1: JSON extraction ──────────────────────────────────────────────────

function extractJSON(text: string): string | null {
  // Try fenced code block first: ```json ... ``` or ``` ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    const candidate = fenced[1].trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1) return candidate.slice(start, end + 1);
  }

  // Fallback: find first { to last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);

  return null;
}

// ── Three-layer robustParse ───────────────────────────────────────────────────

export async function robustParse<T>(
  rawText: string,
  schema: z.ZodType<T>,
  repairFn: (raw: string, errors: string) => Promise<string>
): Promise<T> {
  // Layer 1: extract JSON candidate
  const candidate = extractJSON(rawText);

  if (candidate) {
    try {
      // Layer 2: Zod validation
      const parsed = JSON.parse(candidate);
      const result = schema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }

      // Layer 3: single self-repair attempt
      const errorSummary = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      const repairedText = await repairFn(rawText, errorSummary);
      const repairedCandidate = extractJSON(repairedText);

      if (repairedCandidate) {
        const repairParsed = JSON.parse(repairedCandidate);
        const repairResult = schema.safeParse(repairParsed);
        if (repairResult.success) {
          return repairResult.data;
        }
        throw new ParseError(
          'LLM output failed all 3 robustness layers',
          rawText,
          repairedText,
          repairResult.error
        );
      }

      throw new ParseError(
        'LLM output failed all 3 robustness layers (repair returned no JSON)',
        rawText,
        repairedText,
        result.error
      );
    } catch (err) {
      if (err instanceof ParseError) throw err;
      if (err instanceof SyntaxError) {
        // JSON.parse failed — try repair
        const errorSummary = `JSON parse error: ${err.message}`;
        const repairedText = await repairFn(rawText, errorSummary);
        const repairedCandidate = extractJSON(repairedText);

        if (repairedCandidate) {
          try {
            const repairParsed = JSON.parse(repairedCandidate);
            const repairResult = schema.safeParse(repairParsed);
            if (repairResult.success) return repairResult.data;
            throw new ParseError(
              'LLM output failed all 3 robustness layers',
              rawText,
              repairedText,
              repairResult.error
            );
          } catch (innerErr) {
            if (innerErr instanceof ParseError) throw innerErr;
          }
        }
      }
      throw new ParseError(
        'LLM output failed all 3 robustness layers (JSON extraction failed)',
        rawText,
        null,
        null
      );
    }
  }

  throw new ParseError(
    'No JSON object found in LLM output',
    rawText,
    null,
    null
  );
}

// ── Main chat function ────────────────────────────────────────────────────────

export async function chatJSON<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>
): Promise<T> {
  if (env.MOCK_AI) {
    throw new Error('MOCK_AI mode: chatJSON called — use fixtures instead');
  }

  const client = getNimClient();

  const makeRepairFn =
    (originalMessages: ChatMessage[]) =>
    async (raw: string, errors: string): Promise<string> => {
      const repairMessages: ChatMessage[] = [
        ...originalMessages,
        { role: 'assistant', content: raw },
        {
          role: 'user',
          content: `Your previous response failed JSON validation. Fix these errors and return ONLY valid JSON:\n${errors}`,
        },
      ];
      const repairStream = await client.chat.completions.create({
        model: env.NIM_MODEL,
        temperature: 0.2,
        max_tokens: 4096,
        messages: repairMessages,
        stream: true,
      });
      let repaired = '';
      for await (const chunk of repairStream) {
        repaired += chunk.choices[0]?.delta?.content ?? '';
      }
      return repaired;
    };

  const stream = await client.chat.completions.create({
    model: env.NIM_MODEL,
    temperature: 0.4,
    max_tokens: 4096,
    messages,
    stream: true,
  });

  let rawText = '';
  for await (const chunk of stream) {
    rawText += chunk.choices[0]?.delta?.content ?? '';
  }

  return robustParse(rawText, schema, makeRepairFn(messages));
}
