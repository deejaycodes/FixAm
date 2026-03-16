import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fixam-dev-secret';

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await AdminUser.findOne({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const existing = await AdminUser.findOne({ where: { email } });
  if (existing) { res.status(400).json({ error: 'Email already registered' }); return; }
  const hashed = await bcrypt.hash(password, 10);
  const user = await AdminUser.create({ email, password: hashed, name });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
