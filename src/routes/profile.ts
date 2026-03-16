import { Router, Request, Response } from 'express';
import { Artisan, ServiceRequest } from '../models';
import { fn, col, Op } from 'sequelize';

const router = Router();

// Public artisan profile — no auth required
router.get('/:slug', async (req: Request, res: Response) => {
  const artisan = await Artisan.findOne({ where: { profileSlug: req.params.slug as string } });
  if (!artisan) { res.status(404).json({ error: 'Artisan not found' }); return; }

  const recentJobs = await ServiceRequest.findAll({
    where: { ArtisanId: artisan.id, status: 'completed', rating: { [Op.ne]: null } },
    attributes: ['serviceType', 'rating', 'completedAt'],
    order: [['completedAt', 'DESC']],
    limit: 10,
    raw: true,
  });

  const stats = await ServiceRequest.findOne({
    where: { ArtisanId: artisan.id, status: 'completed' },
    attributes: [[fn('COUNT', col('id')), 'totalJobs'], [fn('AVG', col('rating')), 'avgRating']],
    raw: true,
  }) as any;

  res.json({
    name: artisan.name,
    services: artisan.services,
    rating: artisan.rating,
    totalJobs: parseInt(stats?.totalJobs) || 0,
    bio: artisan.bio,
    verified: artisan.verified,
    ninVerified: artisan.ninVerified,
    recentJobs,
    whatsappLink: `https://wa.me/${artisan.phone}`,
    liveLocation: artisan.sharingLocation ? artisan.liveLocation : null,
  });
});

export default router;
