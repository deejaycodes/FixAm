import redis from '../config/redis';

const SESSION_TTL = 60 * 60;
const PREFIX = 'fixam:session:';

export interface Session {
  step: string;
  role?: 'customer' | 'artisan';
  serviceType?: string;
  description?: string;
  location?: { lat: number; lng: number };
  requestId?: string;
  artisanName?: string;
  artisanServices?: string[];
  lastArtisanId?: string;
  lastServiceType?: string;
  repeatArtisanId?: string;
  emergency?: boolean;
}

const memStore = new Map<string, Session>();

export async function getSession(from: string): Promise<Session> {
  if (redis) {
    const data = await redis.get(PREFIX + from);
    return data ? JSON.parse(data) : { step: 'start' };
  }
  return memStore.get(from) || { step: 'start' };
}

export async function setSession(from: string, session: Session): Promise<void> {
  if (redis) {
    await redis.set(PREFIX + from, JSON.stringify(session), 'EX', SESSION_TTL);
  } else {
    memStore.set(from, session);
  }
}

export async function deleteSession(from: string): Promise<void> {
  if (redis) {
    await redis.del(PREFIX + from);
  } else {
    memStore.delete(from);
  }
}
