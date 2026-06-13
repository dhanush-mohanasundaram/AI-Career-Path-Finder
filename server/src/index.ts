import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { runAnalysis } from './agents/orchestrator';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'AI Career Path Finder' }));

// SSE stream endpoint — no auth required for MVP
app.get('/api/analyze/stream', async (req, res) => {
  const role = (req.query.role as string)?.trim();
  if (!role) { res.status(400).json({ error: 'role is required' }); return; }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    (res as unknown as { flush?: () => void }).flush?.();
  };

  try {
    const result = await runAnalysis(role, send);
    send('complete', result);
  } catch (err: unknown) {
    send('error', { message: (err as Error).message });
  } finally {
    res.end();
  }
});

app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.PORT, () => console.log(`⚡ AI Career Path Finder API :${env.PORT}`));
}).catch(() => {
  // Start without DB — analysis works without persistence for MVP
  app.listen(env.PORT, () => console.log(`⚡ AI Career Path Finder API :${env.PORT} (no DB)`));
});
