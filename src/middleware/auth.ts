import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fixam-dev-secret';

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!process.env.ADMIN_API_KEY && !process.env.JWT_SECRET) { next(); return; }

  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) { next(); return; }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      (req as any).user = jwt.verify(authHeader.slice(7), JWT_SECRET);
      next();
      return;
    } catch { /* invalid token */ }
  }

  res.status(401).json({ error: 'Unauthorized' });
}

export function customerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
    if (!payload.customerId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    (req as any).customerId = payload.customerId;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
