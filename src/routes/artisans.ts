import { Router, Request, Response } from 'express';
import { Artisan } from '../models';
import { verifyNIN } from '../services/nin';
import { createSubaccount, listBanks } from '../services/paystack';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const artisan = await Artisan.create(req.body);
    res.status(201).json(artisan);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  const artisans = await Artisan.findAll({ order: [['rating', 'DESC']] });
  res.json(artisans);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const artisan = await Artisan.findByPk(req.params.id as string);
  if (!artisan) { res.status(404).json({ error: 'Not found' }); return; }
  await artisan.update(req.body);
  res.json(artisan);
});

router.post('/:id/verify-nin', async (req: Request, res: Response) => {
  try {
    const artisan = await Artisan.findByPk(req.params.id as string);
    if (!artisan) { res.status(404).json({ error: 'Not found' }); return; }
    const identity = await verifyNIN(req.body.nin);
    await artisan.update({ ninVerified: true, verified: true });
    res.json({ artisan, identity: { firstName: identity.firstName, lastName: identity.lastName } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/bank', async (req: Request, res: Response) => {
  try {
    const artisan = await Artisan.findByPk(req.params.id as string);
    if (!artisan) { res.status(404).json({ error: 'Not found' }); return; }
    const sub = await createSubaccount({ businessName: artisan.name, bankCode: req.body.bankCode, accountNumber: req.body.accountNumber });
    await artisan.update({ paystackSubaccount: sub.subaccount_code });
    res.json({ subaccountCode: sub.subaccount_code });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/banks/list', async (_req: Request, res: Response) => {
  try {
    const banks = await listBanks();
    res.json(banks);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
