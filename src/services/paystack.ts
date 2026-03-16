import axios from 'axios';

const PAYSTACK_BASE = 'https://api.paystack.co';
const headers = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

export const COMMISSION_PCT = 15;

interface InitPaymentParams {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  subaccountCode?: string;
}

export async function createSubaccount(params: { businessName: string; bankCode: string; accountNumber: string }) {
  const { data } = await axios.post(`${PAYSTACK_BASE}/subaccount`, {
    business_name: params.businessName,
    settlement_bank: params.bankCode,
    account_number: params.accountNumber,
    percentage_charge: COMMISSION_PCT,
  }, { headers });
  return data.data as { subaccount_code: string };
}

export async function initializePayment({ email, amount, reference, callbackUrl, subaccountCode }: InitPaymentParams) {
  const body: Record<string, unknown> = { email, amount, reference, callback_url: callbackUrl };
  if (subaccountCode) {
    body.subaccount = subaccountCode;
    body.bearer = 'subaccount';
  }
  const { data } = await axios.post(`${PAYSTACK_BASE}/transaction/initialize`, body, { headers });
  return data.data as { authorization_url: string; reference: string };
}

export async function verifyPayment(reference: string) {
  const { data } = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, { headers });
  return data.data as { status: string };
}

export async function listBanks() {
  const { data } = await axios.get(`${PAYSTACK_BASE}/bank?country=nigeria`, { headers });
  return data.data as { name: string; code: string }[];
}
