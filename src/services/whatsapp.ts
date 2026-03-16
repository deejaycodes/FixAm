import axios from 'axios';
import { sendSMS } from './sms';

const GRAPH_API = 'https://graph.facebook.com/v18.0';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

interface ListSection {
  title: string;
  rows: { id: string; title: string }[];
}

export async function sendMessage(to: string, text: string): Promise<void> {
  try {
    await axios.post(`${GRAPH_API}/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }, {
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`WhatsApp failed for ${to}, falling back to SMS:`, err.message);
    await sendSMS(to, text);
  }
}

export async function sendInteractiveList(to: string, bodyText: string, buttonText: string, sections: ListSection[]): Promise<void> {
  try {
    await axios.post(`${GRAPH_API}/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: bodyText },
        action: { button: buttonText, sections },
      },
    }, {
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const options = sections.flatMap(s => s.rows).map(r => r.title).join('\n');
    const fallback = `${bodyText}\n\nReply with one of:\n${options}`;
    console.error(`WhatsApp failed for ${to}, falling back to SMS:`, err.message);
    await sendSMS(to, fallback);
  }
}
