import { Artisan, ServiceRequest, Quote } from '../models';
import { Op } from 'sequelize';
import { sendMessage } from './whatsapp';
import type { ServiceType } from './pricing';

const MAX_QUOTES = 3;

export async function requestQuotes(requestId: string, serviceType: ServiceType, customerLocation: { lat: number; lng: number }): Promise<number> {
  const artisans = await Artisan.findAll({
    where: { services: { [Op.contains]: [serviceType] }, verified: true, available: true },
    order: [['rating', 'DESC']],
    limit: MAX_QUOTES,
  });

  let sent = 0;
  for (const artisan of artisans) {
    if (!artisan.whatsappId) continue;
    await Quote.create({ price: 0, ServiceRequestId: requestId, ArtisanId: artisan.id });
    await sendMessage(artisan.whatsappId,
      `💼 Quote request!\nService: ${serviceType}\nReply with your price in naira (e.g. "15000")`
    );
    sent++;
  }

  return sent;
}

export async function submitQuote(artisanId: string, price: number): Promise<boolean> {
  const quote = await Quote.findOne({
    where: { ArtisanId: artisanId, status: 'pending', price: 0 },
    order: [['createdAt', 'DESC']],
  });
  if (!quote) return false;
  await quote.update({ price: price * 100, status: 'pending' }); // store in kobo
  return true;
}

export async function getQuotesForRequest(requestId: string) {
  return Quote.findAll({
    where: { ServiceRequestId: requestId, price: { [Op.gt]: 0 } },
    include: [Artisan],
    order: [['price', 'ASC']],
  });
}

export async function acceptQuote(quoteId: string) {
  const quote = await Quote.findByPk(quoteId, { include: [Artisan] });
  if (!quote) return null;

  await quote.update({ status: 'accepted' });
  await Quote.update({ status: 'rejected' }, {
    where: { ServiceRequestId: quote.ServiceRequestId, id: { [Op.ne]: quoteId } },
  });
  await ServiceRequest.update(
    { ArtisanId: quote.ArtisanId, estimatedPrice: quote.price, status: 'assigned' },
    { where: { id: quote.ServiceRequestId } }
  );

  return quote;
}

export { MAX_QUOTES };
