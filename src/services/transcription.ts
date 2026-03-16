import axios from 'axios';
import FormData from 'form-data';

const GRAPH_API = 'https://graph.facebook.com/v18.0';
const TOKEN = process.env.WHATSAPP_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

export async function transcribeVoiceNote(mediaId: string): Promise<string | null> {
  if (!OPENAI_KEY) return null;

  const { data: media } = await axios.get(`${GRAPH_API}/${mediaId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const { data: audioBuffer } = await axios.get(media.url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    responseType: 'arraybuffer',
  });

  const form = new FormData();
  form.append('file', Buffer.from(audioBuffer), { filename: 'voice.ogg', contentType: 'audio/ogg' });
  form.append('model', 'whisper-1');
  form.append('language', 'en');

  const { data: result } = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, ...form.getHeaders() },
  });

  return result.text;
}
