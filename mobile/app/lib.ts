const API = 'https://fixam-production.up.railway.app';

export async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Error ${res.status}`); }
  return res.json();
}

// ── Country config ──────────────────────────────────────────────

export type CountryCode = 'NG' | 'GH';

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  phonePlaceholder: string;
  whatsapp: string;
  city: string;
  idType: string;
}

export const countries: Record<CountryCode, Country> = {
  NG: {
    code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦',
    phonePrefix: '+234', phonePlaceholder: '08012345678', whatsapp: '2349124453172',
    city: 'Lagos', idType: 'NIN',
  },
  GH: {
    code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', currencySymbol: 'GH₵',
    phonePrefix: '+233', phonePlaceholder: '024 123 4567', whatsapp: '2349124453172',
    city: 'Accra', idType: 'Ghana Card',
  },
};

const COUNTRY_KEY = 'fixam_country';
export function getCountry(): Country {
  if (typeof window === 'undefined') return countries.NG;
  const saved = localStorage.getItem(COUNTRY_KEY) as CountryCode | null;
  return countries[saved || 'NG'];
}
export function setCountry(code: CountryCode) { localStorage.setItem(COUNTRY_KEY, code); }

// ── Services (country-aware pricing) ────────────────────────────

const pricing: Record<CountryCode, Record<string, string>> = {
  NG: { plumbing: '₦5k', electrical: '₦4k', ac_repair: '₦8k', generator: '₦6k', carpentry: '₦7k', cleaning: '₦15k', fumigation: '₦20k', makeup: '₦30k', mechanic: '₦15k', painting: '₦10k', tiling: '₦15k', welding: '₦10k', cctv: '₦30k', emergency: '₦10k' },
  GH: { plumbing: 'GH₵80', electrical: 'GH₵60', ac_repair: 'GH₵150', generator: 'GH₵100', carpentry: 'GH₵120', cleaning: 'GH₵200', fumigation: 'GH₵250', makeup: 'GH₵400', mechanic: 'GH₵200', painting: 'GH₵150', tiling: 'GH₵200', welding: 'GH₵150', cctv: 'GH₵400', emergency: 'GH₵200' },
};

export function getServices(country?: CountryCode) {
  const c = country || getCountry().code;
  const p = pricing[c];
  return [
    { id: 'plumbing', icon: '🔧', name: 'Plumbing', desc: 'Pipes & drainage', bg: 'bg-teal-200', from: p.plumbing },
    { id: 'electrical', icon: '⚡', name: 'Electrical', desc: 'Wiring & lights', bg: 'bg-amber-200', from: p.electrical },
    { id: 'ac_repair', icon: '❄️', name: 'AC Repair', desc: 'Cooling systems', bg: 'bg-blue-200', from: p.ac_repair },
    { id: 'generator', icon: '⚙️', name: 'Generator', desc: 'Power solutions', bg: 'bg-orange-200', from: p.generator },
    { id: 'cleaning', icon: '🧹', name: 'Cleaning', desc: 'Home & deep clean', bg: 'bg-emerald-200', from: p.cleaning },
    { id: 'fumigation', icon: '🪲', name: 'Fumigation', desc: 'Pest control', bg: 'bg-lime-200', from: p.fumigation },
    { id: 'makeup', icon: '💄', name: 'Makeup', desc: 'Bridal & events', bg: 'bg-pink-200', from: p.makeup },
    { id: 'mechanic', icon: '🚗', name: 'Mechanic', desc: 'Car repair', bg: 'bg-slate-200', from: p.mechanic },
    { id: 'painting', icon: '🎨', name: 'Painting', desc: 'Interior & exterior', bg: 'bg-indigo-200', from: p.painting },
    { id: 'carpentry', icon: '🪚', name: 'Carpentry', desc: 'Wood & furniture', bg: 'bg-violet-200', from: p.carpentry },
    { id: 'tiling', icon: '🧱', name: 'Tiling', desc: 'Floor & wall tiles', bg: 'bg-cyan-200', from: p.tiling },
    { id: 'welding', icon: '🔩', name: 'Welding', desc: 'Gates & railings', bg: 'bg-gray-200', from: p.welding },
    { id: 'cctv', icon: '📹', name: 'CCTV', desc: 'Security cameras', bg: 'bg-rose-200', from: p.cctv },
    { id: 'emergency', icon: '🚨', name: 'Emergency', desc: '24/7 urgent help', bg: 'bg-red-200', from: p.emergency },
  ];
}

// Keep static export for components that don't need country-awareness yet
export const services = getServices('NG');

export const statusMap: Record<string, { icon: string; label: string; color: string; bg: string; step: number }> = {
  pending: { icon: '🔍', label: 'Finding artisan...', color: 'text-amber-600', bg: 'bg-amber-50', step: 0 },
  assigned: { icon: '⏳', label: 'Artisan matched', color: 'text-blue-600', bg: 'bg-blue-50', step: 1 },
  accepted: { icon: '✅', label: 'Artisan accepted', color: 'text-teal-600', bg: 'bg-teal-50', step: 2 },
  in_progress: { icon: '🚗', label: 'On the way', color: 'text-teal-600', bg: 'bg-teal-50', step: 3 },
  completed: { icon: '✅', label: 'Completed', color: 'text-green-600', bg: 'bg-green-50', step: 4 },
  cancelled: { icon: '❌', label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', step: -1 },
};

export const pillColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  accepted: 'bg-teal-100 text-teal-700',
  in_progress: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// Format price for current country
export function formatPrice(kobo: number): string {
  const c = getCountry();
  return `${c.currencySymbol}${(kobo / 100).toLocaleString()}`;
}
