import { Router, Request, Response } from 'express';
import { ServiceRequest, Customer, Artisan, Payment } from '../models';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { status } = req.query;
  const where = status ? { status: status as string } : {};
  const requests = await ServiceRequest.findAll({
    where,
    include: [Customer, Artisan],
    order: [['createdAt', 'DESC']],
  });
  res.json(requests);
});

router.patch('/:id/assign', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request) { res.status(404).json({ error: 'Not found' }); return; }
  await request.update({ ArtisanId: req.body.artisanId, status: 'assigned' });
  res.json(request);
});

router.patch('/:id/complete', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request) { res.status(404).json({ error: 'Not found' }); return; }

  const finalPrice = req.body.finalPrice || request.estimatedPrice;
  const commission = Math.round((finalPrice || 0) * 0.15);

  await request.update({ finalPrice, status: 'completed', completedAt: new Date() });
  const payment = await Payment.create({ amount: finalPrice || 0, commission, ServiceRequestId: request.id });
  res.json({ request, payment });
});

export default router;
