import axios from 'axios';

const TERMII_BASE = 'https://api.ng.termii.com/api';
const TERMII_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER = process.env.TERMII_SENDER_ID || 'FixAm';

export async function sendSMS(to: string, text: string): Promise<unknown> {
  if (!TERMII_KEY) {
    console.log(`[SMS fallback disabled] To: ${to}, Message: ${text}`);
    return null;
  }

  const { data } = await axios.post(`${TERMII_BASE}/sms/send`, {
    api_key: TERMII_KEY,
    to,
    from: TERMII_SENDER,
    sms: text,
    type: 'plain',
    channel: 'generic',
  });

  return data;
}
