import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? 500;
  const message = status === 503 ? 'Database unavailable' : err.message ?? 'Internal server error';
  res.status(status).json({ error: message });
}
