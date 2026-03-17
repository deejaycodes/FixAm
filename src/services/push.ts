import webpush from 'web-push';
import { Customer } from '../models';

// VAPID keys — generate once: npx web-push generate-vapid-keys
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails('mailto:admin@fixam.ng', VAPID_PUBLIC, VAPID_PRIVATE);
}

// Store subscriptions on customer record (we'll use a JSON field)
export async function sendPushToCustomer(customerId: string, payload: { title: string; body: string; url?: string }) {
  if (!VAPID_PUBLIC) return; // Push not configured
  try {
    const customer = await Customer.findByPk(customerId);
    const sub = (customer as any)?.pushSubscription;
    if (!sub) return;
    await webpush.sendNotification(sub, JSON.stringify(payload));
  } catch (e: any) {
    if (e.statusCode === 410) {
      // Subscription expired — clear it
      await Customer.update({ pushSubscription: null } as any, { where: { id: customerId } });
    }
  }
}
