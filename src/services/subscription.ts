import { Customer } from '../models';
import { initializePayment } from './paystack';

const PREMIUM_PRICE = 500000; // ₦5,000 in kobo
const PREMIUM_DAYS = 30;

export function isPremium(customer: InstanceType<typeof Customer>): boolean {
  return customer.subscriptionTier === 'premium' &&
    !!customer.subscriptionExpiresAt &&
    new Date(customer.subscriptionExpiresAt) > new Date();
}

export async function activatePremium(customerId: string): Promise<void> {
  const expires = new Date();
  expires.setDate(expires.getDate() + PREMIUM_DAYS);
  await Customer.update(
    { subscriptionTier: 'premium', subscriptionExpiresAt: expires },
    { where: { id: customerId } }
  );
}

export async function initSubscriptionPayment(email: string, customerId: string) {
  const reference = `fixam_sub_${customerId}_${Date.now()}`;
  return initializePayment({
    email,
    amount: PREMIUM_PRICE,
    reference,
    callbackUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/verify`,
  });
}

export { PREMIUM_PRICE, PREMIUM_DAYS };
