import { Router, Request, Response } from 'express';
import { ServiceRequest, Artisan, Customer, Payment } from '../models';
import { fn, col, literal, Op } from 'sequelize';

const router = Router();

router.get('/overview', async (_req: Request, res: Response) => {
  const [requests, artisans, revenue, customers] = await Promise.all([
    ServiceRequest.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
    Artisan.findAll({ attributes: [[fn('COUNT', col('id')), 'total'], [fn('SUM', literal("CASE WHEN verified = true THEN 1 ELSE 0 END")), 'verified']], raw: true }),
    Payment.findAll({ where: { status: 'paid' }, attributes: [[fn('SUM', col('amount')), 'totalRevenue'], [fn('SUM', col('commission')), 'totalCommission']], raw: true }),
    Customer.count(),
  ]);

  const statusMap: Record<string, number> = {};
  (requests as any[]).forEach(r => { statusMap[r.status] = parseInt(r.count); });
  const a = artisans[0] as any;
  const rev = revenue[0] as any;

  res.json({
    requests: statusMap,
    artisans: { total: parseInt(a.total) || 0, verified: parseInt(a.verified) || 0 },
    revenue: { total: parseInt(rev.totalRevenue) || 0, commission: parseInt(rev.totalCommission) || 0 },
    customers,
  });
});

router.get('/revenue', async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await Payment.findAll({
    where: { status: 'paid', createdAt: { [Op.gte]: since } },
    attributes: [[fn('DATE', col('createdAt')), 'date'], [fn('SUM', col('amount')), 'revenue'], [fn('SUM', col('commission')), 'commission'], [fn('COUNT', col('id')), 'count']],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']],
    raw: true,
  });
  res.json(data);
});

router.get('/services', async (_req: Request, res: Response) => {
  const data = await ServiceRequest.findAll({
    attributes: ['serviceType', [fn('COUNT', col('id')), 'count'], [fn('AVG', col('rating')), 'avgRating']],
    group: ['serviceType'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    raw: true,
  });
  res.json(data);
});

router.get('/areas', async (_req: Request, res: Response) => {
  const requests = await ServiceRequest.findAll({
    where: { location: { [Op.ne]: null } },
    attributes: ['location', 'serviceType'],
    raw: true,
  });

  const grid: Record<string, { lat: number; lng: number; count: number }> = {};
  requests.forEach(r => {
    const loc = r.location;
    if (!loc?.lat) return;
    const key = `${(loc.lat * 100).toFixed(0)},${(loc.lng * 100).toFixed(0)}`;
    if (!grid[key]) grid[key] = { lat: loc.lat, lng: loc.lng, count: 0 };
    grid[key].count++;
  });

  const areas = Object.values(grid).sort((a, b) => b.count - a.count).slice(0, 20);
  res.json(areas);
});

router.get('/disputes', async (_req: Request, res: Response) => {
  const disputes = await ServiceRequest.findAll({
    where: { review: { [Op.ne]: null } },
    include: [Customer, Artisan],
    order: [['updatedAt', 'DESC']],
  });
  res.json(disputes);
});

export default router;
