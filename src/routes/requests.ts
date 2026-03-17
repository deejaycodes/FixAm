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

// Dispute management
router.patch('/:id/dispute', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request) { res.status(404).json({ error: 'Not found' }); return; }
  await request.update({ status: 'disputed' as any, review: req.body.reason || 'Dispute raised by admin' });
  res.json(request);
});

router.patch('/:id/resolve', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string, { include: [Artisan] });
  if (!request) { res.status(404).json({ error: 'Not found' }); return; }
  const { resolution } = req.body; // 'refund' | 'release' | 'redo'
  if (resolution === 'refund') {
    await request.update({ status: 'cancelled', review: `Resolved: refund issued. ${req.body.note || ''}` });
  } else if (resolution === 'redo') {
    await request.update({ ArtisanId: null, status: 'pending', review: `Resolved: redo with new artisan. ${req.body.note || ''}` });
  } else {
    await request.update({ status: 'completed', completedAt: new Date(), review: `Resolved: payment released. ${req.body.note || ''}` });
  }
  res.json(request);
});

// Popular services by area
router.get('/popular', async (req: Request, res: Response) => {
  const { fn, col, Op, literal } = require('sequelize');
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const where: any = { status: { [Op.ne]: 'cancelled' } };
  // If location provided, filter to ~20km radius
  if (!isNaN(lat) && !isNaN(lng)) {
    const d = 0.18; // ~20km in degrees
    where[Op.and] = [
      literal(`CAST("location"->>'lat' AS FLOAT) BETWEEN ${lat - d} AND ${lat + d}`),
      literal(`CAST("location"->>'lng' AS FLOAT) BETWEEN ${lng - d} AND ${lng + d}`),
    ];
  }
  const popular = await ServiceRequest.findAll({
    attributes: ['serviceType', [fn('COUNT', col('id')), 'count']],
    where,
    group: ['serviceType'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    limit: 3,
    raw: true,
  });
  res.json(popular);
});

export default router;
