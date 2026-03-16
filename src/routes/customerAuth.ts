import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Customer } from '../models';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fixam-dev-secret';

function generateReferralCode() {
  return 'FX' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post('/register', async (req: Request, res: Response) => {
  const { phone, name } = req.body;
  if (!phone) { res.status(400).json({ error: 'Phone required' }); return; }

  let customer = await Customer.findOne({ where: { phone } });
  if (customer) { res.status(400).json({ error: 'Phone already registered' }); return; }

  customer = await Customer.create({
    phone,
    name: name || 'Customer',
    whatsappId: phone,
    referralCode: generateReferralCode(),
  });

  const token = jwt.sign({ customerId: customer.id }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, customer: { id: customer.id, phone: customer.phone, name: customer.name, referralCode: customer.referralCode } });
});

router.post('/login', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) { res.status(400).json({ error: 'Phone required' }); return; }

  const customer = await Customer.findOne({ where: { phone } });
  if (!customer) { res.status(404).json({ error: 'Not found. Please register first.' }); return; }

  const token = jwt.sign({ customerId: customer.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, customer: { id: customer.id, phone: customer.phone, name: customer.name, referralCode: customer.referralCode } });
});

export default router;
