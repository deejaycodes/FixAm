import { Router, Request, Response } from 'express';
import { handleIncoming } from '../services/chatbot';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.sendStatus(403);
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message) { res.sendStatus(200); return; }

    const from: string = message.from;
    await handleIncoming(from, message);
    res.sendStatus(200);
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.sendStatus(200);
  }
});

export default router;
