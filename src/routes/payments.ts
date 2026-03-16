import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { initializePayment, verifyPayment } from '../services/paystack';
import { Payment } from '../models';

const router = Router();

router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const { email, amount, requestId } = req.body;
    const reference = `fixam_${requestId}_${Date.now()}`;
    const result = await initializePayment({
      email,
      amount,
      reference,
      callbackUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/verify`,
    });
    await Payment.update({ paystackRef: reference }, { where: { ServiceRequestId: requestId } });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/verify', async (req: Request, res: Response) => {
  try {
    const { reference } = req.query;
    const result = await verifyPayment(reference as string);
    if (result.status === 'success') {
      await Payment.update({ status: 'paid' }, { where: { paystackRef: reference as string } });
    }
    res.json({ status: result.status });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const secret = process.env.PAYSTACK_SECRET_KEY || '';
  const sig = req.headers['x-paystack-signature'] as string;
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

  if (hash !== sig) { res.sendStatus(401); return; }

  const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (event.event === 'charge.success') {
    await Payment.update({ status: 'paid' }, { where: { paystackRef: event.data.reference } });
  }

  res.sendStatus(200);
});

export default router;
