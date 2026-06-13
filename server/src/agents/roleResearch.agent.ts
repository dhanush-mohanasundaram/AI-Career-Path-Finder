import OpenAI from 'openai';
import { env } from '../config/env';

const nim = new OpenAI({ baseURL: env.NIM_BASE_URL, apiKey: env.NVIDIA_NIM_API_KEY });

export async function roleResearchAgent(role: string) {
  const prompt = `You are a senior technical recruiter at top Indian IT companies like TCS, Infosys, Wipro, Zoho, Freshworks, Swiggy, Flipkart, and MNCs like Google India, Microsoft India, Amazon India.

Provide a detailed, accurate role analysis for: "${role}"

Return ONLY valid JSON with this EXACT structure:
{
  "summary": "Precise 2-3 sentence description of what this role does day-to-day in Indian tech companies",
  "responsibilities": [
    "Specific responsibility 1",
    "Specific responsibility 2", 
    "Specific responsibility 3",
    "Specific responsibility 4",
    "Specific responsibility 5",
    "Specific responsibility 6"
  ],
  "demandLevel": "Very High",
  "avgSalaryRange": "₹4 LPA - ₹12 LPA (Fresher to 2 years)",
  "experienceRequired": "0-2 years for fresher, 2-5 years for mid-level, 5+ for senior"
}

IMPORTANT: Use Indian salary in LPA (Lakhs Per Annum) format like "₹4 LPA - ₹25 LPA". Be specific to the ${role} role.`;

  try {
    const res = await nim.chat.completions.create({
      model: env.NIM_MODEL, temperature: 0.2, max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });
    const parsed = parseJSON(res.choices[0]?.message?.content ?? '{}');
    return parsed || fallbackOverview(role);
  } catch { return fallbackOverview(role); }
}

function fallbackOverview(role: string) {
  const salaries: Record<string, string> = {
    'software development engineer': '₹5 LPA - ₹30 LPA',
    'full stack developer': '₹4 LPA - ₹25 LPA',
    'backend engineer': '₹5 LPA - ₹28 LPA',
    'frontend engineer': '₹4 LPA - ₹22 LPA',
    'ai engineer': '₹8 LPA - ₹50 LPA',
    'machine learning engineer': '₹8 LPA - ₹45 LPA',
    'data engineer': '₹6 LPA - ₹35 LPA',
    'devops engineer': '₹6 LPA - ₹32 LPA',
    'cloud engineer': '₹6 LPA - ₹35 LPA',
    'cybersecurity engineer': '₹5 LPA - ₹30 LPA',
    'mobile app developer': '₹4 LPA - ₹25 LPA',
  };
  const key = role.toLowerCase();
  const salary = salaries[key] ?? '₹4 LPA - ₹25 LPA';

  return {
    summary: `${role} is one of the most sought-after roles in India's IT industry. Professionals in this role design, build, and maintain software systems used by millions. Indian companies like Zoho, Freshworks, Razorpay, and global MNCs actively hire for this role.`,
    responsibilities: [
      'Design and develop scalable software solutions for production systems',
      'Write clean, well-documented, and testable code following industry standards',
      'Collaborate with product managers, designers, and other engineers',
      'Participate in code reviews and maintain code quality standards',
      'Debug, troubleshoot, and resolve production issues',
      'Continuously learn and adopt new technologies relevant to the role',
    ],
    demandLevel: 'Very High',
    avgSalaryRange: salary,
    experienceRequired: 'Fresher (0-1 yr): ₹3-6 LPA | Junior (1-3 yr): ₹6-15 LPA | Mid (3-6 yr): ₹15-30 LPA',
  };
}

function parseJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const s = candidate.indexOf('{'), e = candidate.lastIndexOf('}');
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(candidate.slice(s, e + 1)); } catch { return null; }
}
