import { Router, Request, Response } from 'express';
import { ServiceRequest, Artisan, Customer } from '../models';
import { findBestArtisan } from '../services/matching';
import { estimatePrice, applyLoyaltyDiscount } from '../services/pricing';
import { sendMessage, sendButtons } from '../services/whatsapp';
import { initializePayment } from '../services/paystack';

const router = Router();

// Create a new service request
router.post('/', async (req: Request, res: Response) => {
  const customerId = (req as any).customerId;
  const { serviceType, description, location, emergency } = req.body;

  const priceRange = estimatePrice(serviceType, description, emergency);
  const request = await ServiceRequest.create({
    serviceType,
    description,
    location,
    estimatedPrice: priceRange ? priceRange.min * 100 : undefined,
    CustomerId: customerId,
  });

  // Auto-match
  const artisan = await findBestArtisan(serviceType, location);
  if (artisan) {
    await request.update({ ArtisanId: artisan.id, status: 'assigned' });
    if (artisan.whatsappId) {
      const urgency = emergency ? '🚨 EMERGENCY ' : '';
      const est = priceRange ? `₦${priceRange.min.toLocaleString()} – ₦${priceRange.max.toLocaleString()}` : 'TBD';
      await sendButtons(artisan.whatsappId, `🔔 ${urgency}New job!\nService: ${serviceType}\nProblem: ${description}\nEstimate: ${est}`, [
        { id: 'accept', title: '✅ Accept' },
        { id: 'decline', title: '❌ Decline' },
      ]);
    }
  }

  const full = await ServiceRequest.findByPk(request.id, { include: [Artisan] });
  res.status(201).json(full);
});

// Get my requests
router.get('/mine', async (req: Request, res: Response) => {
  const customerId = (req as any).customerId;
  const requests = await ServiceRequest.findAll({
    where: { CustomerId: customerId },
    include: [Artisan],
    order: [['createdAt', 'DESC']],
  });
  res.json(requests);
});

// Get single request
router.get('/:id', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string, { include: [Artisan] });
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  // Hide artisan phone until accepted
  const json = request.toJSON() as any;
  if (json.Artisan && request.status !== 'accepted' && request.status !== 'in_progress' && request.status !== 'completed') {
    delete json.Artisan.phone;
    delete json.Artisan.whatsappId;
  }
  res.json(json);
});

// Rate
router.post('/:id/rate', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const { rating } = req.body;
  await request.update({ rating, status: 'completed', completedAt: new Date() });
  if (request.ArtisanId) {
    const { fn, col } = require('sequelize');
    const stats = await ServiceRequest.findOne({
      where: { ArtisanId: request.ArtisanId, status: 'completed', rating: { [require('sequelize').Op.ne]: null } },
      attributes: [[fn('AVG', col('rating')), 'avgRating']],
      raw: true,
    }) as any;
    await Artisan.update({ rating: parseFloat(stats?.avgRating) || 0 }, { where: { id: request.ArtisanId } });
  }
  res.json({ success: true });
});

// Pay via Paystack
router.post('/:id/pay', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string, { include: [Artisan] });
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  if (!request.estimatedPrice) { res.status(400).json({ error: 'No price set' }); return; }
  const customer = await Customer.findByPk((req as any).customerId);
  const ref = `fixam_${request.id}_${Date.now()}`;
  try {
    const payment = await initializePayment({
      email: `${customer?.phone || 'customer'}@fixam.ng`,
      amount: request.estimatedPrice,
      reference: ref,
      callbackUrl: 'https://out-one-red.vercel.app',
      subaccountCode: (request.Artisan as any)?.paystackSubaccount || undefined,
    });
    res.json({ url: payment.authorization_url, reference: payment.reference });
  } catch (e: any) { res.status(500).json({ error: 'Payment init failed' }); }
});

// Upload photo
router.post('/:id/photo', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const { photo } = req.body; // base64 string
  if (!photo) { res.status(400).json({ error: 'Photo required' }); return; }
  const photos = request.photos || [];
  photos.push(photo);
  await request.update({ photos });
  res.json({ success: true, count: photos.length });
});

// Cancel
router.post('/:id/cancel', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string, { include: [Artisan] });
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  if (request.status === 'accepted' || request.status === 'in_progress') {
    res.status(400).json({ error: 'Artisan is already on the way. Contact them directly.' }); return;
  }
  if (request.Artisan?.whatsappId) {
    await sendMessage(request.Artisan.whatsappId, '⚠️ The customer has cancelled this job.');
  }
  await request.update({ status: 'cancelled' });
  res.json({ success: true });
});

export default router;
