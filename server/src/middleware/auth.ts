import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthedRequest, res: Response, next: NextFunction): void {
  const raw =
    req.headers.authorization?.replace('Bearer ', '') ||
    (req.query.token as string);

  if (!raw) { res.status(401).json({ error: 'Authentication required' }); return; }

  try {
    const payload = jwt.verify(raw, env.JWT_SECRET) as { id: string };
    req.userId = payload.id;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
