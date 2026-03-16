import axios from 'axios';
import { sendSMS } from './sms';

const GRAPH_API = 'https://graph.facebook.com/v18.0';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

interface ListSection {
  title: string;
  rows: { id: string; title: string; description?: string }[];
}

interface ReplyButton {
  id: string;
  title: string;
}

export async function sendMessage(to: string, text: string): Promise<void> {
  try {
    await axios.post(`${GRAPH_API}/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp', to, type: 'text', text: { body: text },
    }, { headers });
  } catch (err: any) {
    console.error(`WhatsApp failed for ${to}, falling back to SMS:`, err.message);
    await sendSMS(to, text);
  }
}

export async function sendButtons(to: string, bodyText: string, buttons: ReplyButton[]): Promise<void> {
  try {
    await axios.post(`${GRAPH_API}/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp', to, type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: { buttons: buttons.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title } })) },
      },
    }, { headers });
  } catch (err: any) {
    const fallback = `${bodyText}\n\nReply: ${buttons.map(b => b.title).join(' / ')}`;
    console.error(`WhatsApp buttons failed for ${to}:`, err.message);
    await sendSMS(to, fallback);
  }
}

export async function sendLocation(to: string, lat: number, lng: number, name: string, address?: string): Promise<void> {
  try {
    await axios.post(`${GRAPH_API}/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp', to, type: 'location',
      location: { latitude: lat, longitude: lng, name, address: address || '' },
    }, { headers });
  } catch (err: any) {
    console.error(`WhatsApp location failed for ${to}:`, err.message);
    await sendMessage(to, `📍 ${name}: https://maps.google.com/?q=${lat},${lng}`);
  }
}

export async function sendImage(to: string, imageUrl: string, caption?: string): Promise<void> {
  try {
    await axios.post(`${GRAPH_API}/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp', to, type: 'image',
      image: { link: imageUrl, caption: caption || '' },
    }, { headers });
  } catch (err: any) {
    console.error(`WhatsApp image failed for ${to}:`, err.message);
    if (caption) await sendMessage(to, caption);
  }
}

export async function sendInteractiveList(to: string, bodyText: string, buttonText: string, sections: ListSection[]): Promise<void> {
  try {
    await axios.post(`${GRAPH_API}/${PHONE_ID}/messages`, {
      messaging_product: 'whatsapp', to, type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: bodyText },
        action: { button: buttonText, sections },
      },
    }, { headers });
  } catch (err: any) {
    const options = sections.flatMap(s => s.rows).map(r => r.title).join('\n');
    const fallback = `${bodyText}\n\nReply with one of:\n${options}`;
    console.error(`WhatsApp list failed for ${to}:`, err.message);
    await sendSMS(to, fallback);
  }
}
