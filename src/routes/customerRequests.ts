import { Router, Request, Response } from 'express';
import { ServiceRequest, Artisan, Customer, Quote, Message, Payment } from '../models';
import { findBestArtisan } from '../services/matching';
import { estimatePrice, applyLoyaltyDiscount } from '../services/pricing';
import { sendMessage, sendButtons } from '../services/whatsapp';
import { initializePayment, createDedicatedAccount } from '../services/paystack';
import { sendPushToCustomer } from '../services/push';

const router = Router();

// Create a new service request
router.post('/', async (req: Request, res: Response) => {
  const customerId = (req as any).customerId;
  const { serviceType, description, location, emergency, scheduledAt } = req.body;

  const priceRange = estimatePrice(serviceType, description, emergency);
  const request = await ServiceRequest.create({
    serviceType,
    description,
    location,
    estimatedPrice: priceRange ? priceRange.min * 100 : undefined,
    CustomerId: customerId,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
  });

  // Auto-match
  const artisan = await findBestArtisan(serviceType, location);
  if (artisan) {
    await request.update({ ArtisanId: artisan.id, status: 'assigned' });
    // Push notification to customer
    sendPushToCustomer(customerId, { title: '🎉 Artisan Found!', body: `${artisan.name} has been matched to your ${serviceType} request.`, url: '/' }).catch(() => {});
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
  const request = await ServiceRequest.findByPk(req.params.id as string, { include: [Artisan, { model: Quote, include: [Artisan] }] });
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const json = request.toJSON() as any;
  // Include artisan portfolio
  if (json.Artisan) {
    json.Artisan.portfolioPhotos = json.Artisan.portfolioPhotos || [];
    if (request.status !== 'accepted' && request.status !== 'in_progress' && request.status !== 'completed') {
      delete json.Artisan.phone;
      delete json.Artisan.whatsappId;
    }
  }
  // ETA: if artisan is sharing location, calculate distance-based ETA
  if (json.Artisan?.liveLocation && request.location && (request.status === 'accepted' || request.status === 'in_progress')) {
    const R = 6371;
    const dLat = (request.location.lat - json.Artisan.liveLocation.lat) * Math.PI / 180;
    const dLng = (request.location.lng - json.Artisan.liveLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(json.Artisan.liveLocation.lat*Math.PI/180) * Math.cos(request.location.lat*Math.PI/180) * Math.sin(dLng/2)**2;
    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    json.eta = Math.max(5, Math.round(km / 25 * 60)); // ~25km/h Lagos traffic, min 5 min
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

// Messages — get
router.get('/:id/messages', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const messages = await Message.findAll({ where: { ServiceRequestId: req.params.id }, order: [['createdAt', 'ASC']] });
  res.json(messages);
});

// Messages — send
router.post('/:id/messages', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string, { include: [Artisan] });
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const { text } = req.body;
  if (!text?.trim()) { res.status(400).json({ error: 'Text required' }); return; }
  const msg = await Message.create({ text: text.trim(), sender: 'customer', ServiceRequestId: request.id });
  // Forward to artisan via WhatsApp
  if (request.Artisan?.whatsappId) {
    await sendMessage(request.Artisan.whatsappId, `💬 Customer: ${text.trim()}`).catch(() => {});
  }
  res.status(201).json(msg);
});

// Accept a quote
router.post('/:id/quotes/:quoteId/accept', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const quote = await Quote.findByPk(req.params.quoteId as string, { include: [Artisan] });
  if (!quote || quote.ServiceRequestId !== request.id) {
    res.status(404).json({ error: 'Quote not found' }); return;
  }
  // Accept this quote, reject others
  await Quote.update({ status: 'rejected' }, { where: { ServiceRequestId: request.id } });
  await quote.update({ status: 'accepted' });
  await request.update({ ArtisanId: quote.ArtisanId, estimatedPrice: quote.price, status: 'assigned' });
  if ((quote as any).Artisan?.whatsappId) {
    await sendMessage((quote as any).Artisan.whatsappId, '✅ Your quote was accepted! Please head to the customer.').catch(() => {});
  }
  res.json({ success: true });
});

// Escrow: pay & hold (customer pays, money held until job confirmed)
router.post('/:id/escrow', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  if (!request.estimatedPrice) { res.status(400).json({ error: 'No price set' }); return; }
  const customer = await Customer.findByPk((req as any).customerId);
  const ref = `fixam_escrow_${request.id}_${Date.now()}`;
  try {
    const payment = await initializePayment({
      email: `${customer?.phone || 'customer'}@fixam.ng`,
      amount: request.estimatedPrice,
      reference: ref,
      callbackUrl: 'https://out-one-red.vercel.app',
      // No subaccount — money stays in FixAm's Paystack balance until released
    });
    await Payment.create({ amount: request.estimatedPrice, ServiceRequestId: request.id, paystackRef: ref, status: 'pending' });
    res.json({ url: payment.authorization_url, reference: payment.reference });
  } catch { res.status(500).json({ error: 'Payment init failed' }); }
});

// Escrow: customer confirms job done → release payment to artisan
router.post('/:id/release', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string, { include: [Artisan] });
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  const payment = await Payment.findOne({ where: { ServiceRequestId: request.id, status: 'paid' } });
  if (!payment) { res.status(400).json({ error: 'No held payment found' }); return; }
  // Transfer 85% to artisan via Paystack Transfers API
  const artisanAmount = Math.round(payment.amount * 0.85);
  const commission = payment.amount - artisanAmount;
  await payment.update({ commission, status: 'paid' });
  await request.update({ status: 'completed', completedAt: new Date(), finalPrice: payment.amount });
  // Note: actual Paystack transfer would go here with their Transfers API
  res.json({ success: true, artisanAmount, commission });
});

// Transfer payment (bank transfer channel)
router.post('/:id/transfer', async (req: Request, res: Response) => {
  const request = await ServiceRequest.findByPk(req.params.id as string);
  if (!request || request.CustomerId !== (req as any).customerId) {
    res.status(404).json({ error: 'Not found' }); return;
  }
  if (!request.estimatedPrice) { res.status(400).json({ error: 'No price set' }); return; }
  const customer = await Customer.findByPk((req as any).customerId);
  const ref = `fixam_tr_${request.id}_${Date.now()}`;
  try {
    const result = await createDedicatedAccount({ email: `${customer?.phone || 'customer'}@fixam.ng`, reference: ref, amount: request.estimatedPrice });
    res.json({ url: result.authorization_url, reference: result.reference });
  } catch { res.status(500).json({ error: 'Transfer init failed' }); }
});

// Save push subscription
router.post('/push/subscribe', async (req: Request, res: Response) => {
  const customerId = (req as any).customerId;
  const { subscription } = req.body;
  if (!subscription) { res.status(400).json({ error: 'Subscription required' }); return; }
  await Customer.update({ pushSubscription: subscription } as any, { where: { id: customerId } });
  res.json({ success: true });
});

// Update profile
router.put('/profile', async (req: Request, res: Response) => {
  const customerId = (req as any).customerId;
  const { name, phone } = req.body;
  const updates: any = {};
  if (name?.trim()) updates.name = name.trim();
  if (phone?.trim()) updates.phone = phone.trim();
  await Customer.update(updates, { where: { id: customerId } });
  const customer = await Customer.findByPk(customerId);
  res.json({ id: customer!.id, name: customer!.name, phone: customer!.phone, referralCode: customer!.referralCode });
});

export default router;
