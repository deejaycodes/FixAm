export interface WhatsAppMessage {
  text?: { body: string };
  interactive?: { list_reply?: { id: string }; button_reply?: { id: string } };
  location?: { latitude: number; longitude: number };
  audio?: { id: string };
  image?: { id: string };
}
