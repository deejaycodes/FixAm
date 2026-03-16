import axios from 'axios';

const VERIFYME_BASE = 'https://vapi.verifyme.ng/v1';
const VERIFYME_KEY = process.env.VERIFYME_API_KEY;

interface NINResult {
  firstName: string;
  lastName: string;
  phone: string;
  photo: string;
  verified: boolean;
}

export async function verifyNIN(nin: string): Promise<NINResult> {
  if (!VERIFYME_KEY) throw new Error('VERIFYME_API_KEY not configured');

  const { data } = await axios.post(`${VERIFYME_BASE}/verifications/identities/nin/${nin}`, {}, {
    headers: { Authorization: `Bearer ${VERIFYME_KEY}` },
  });

  if (data.status !== 'success') throw new Error(data.message || 'NIN verification failed');

  return {
    firstName: data.data.firstname,
    lastName: data.data.lastname,
    phone: data.data.phone,
    photo: data.data.photo,
    verified: true,
  };
}
