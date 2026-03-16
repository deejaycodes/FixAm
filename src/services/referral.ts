import { Customer, Artisan } from '../models';

export const REFERRAL_DISCOUNT = 100000; // ₦1,000 in kobo

interface ReferralResult {
  discount: number;
  referrerName: string;
}

export async function applyReferralCode(code: string, newCustomerId: string): Promise<ReferralResult | null> {
  const referrer = await Customer.findOne({ where: { referralCode: code } });
  if (referrer && referrer.id !== newCustomerId) {
    await Customer.update({ referredBy: referrer.id }, { where: { id: newCustomerId } });
    return { discount: REFERRAL_DISCOUNT, referrerName: referrer.name || 'a friend' };
  }

  const artisan = await Artisan.findOne({ where: { referralCode: code } });
  if (artisan) {
    await artisan.update({ priorityBoost: true });
    await Customer.update({ referredBy: artisan.id }, { where: { id: newCustomerId } });
    return { discount: REFERRAL_DISCOUNT, referrerName: artisan.name };
  }

  return null;
}
