const API = 'https://fixam-production.up.railway.app';

export async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Error ${res.status}`); }
  return res.json();
}

export const services = [
  { id: 'plumbing', icon: '🔧', name: 'Plumbing', desc: 'Pipes & drainage', bg: 'bg-teal-100', border: 'border-teal-200' },
  { id: 'electrical', icon: '⚡', name: 'Electrical', desc: 'Wiring & lights', bg: 'bg-amber-100', border: 'border-amber-200' },
  { id: 'ac_repair', icon: '❄️', name: 'AC Repair', desc: 'Cooling systems', bg: 'bg-blue-100', border: 'border-blue-200' },
  { id: 'generator', icon: '⚙️', name: 'Generator', desc: 'Power solutions', bg: 'bg-orange-100', border: 'border-orange-200' },
  { id: 'carpentry', icon: '🪚', name: 'Carpentry', desc: 'Wood & furniture', bg: 'bg-violet-100', border: 'border-violet-200' },
  { id: 'emergency', icon: '🚨', name: 'Emergency', desc: '24/7 urgent help', bg: 'bg-red-100', border: 'border-red-200' },
];

export const statusMap: Record<string, { icon: string; label: string; color: string; bg: string; step: number }> = {
  pending: { icon: '🔍', label: 'Finding artisan...', color: 'text-amber-600', bg: 'bg-amber-50', step: 0 },
  assigned: { icon: '⏳', label: 'Artisan matched', color: 'text-blue-600', bg: 'bg-blue-50', step: 1 },
  accepted: { icon: '🚗', label: 'On the way', color: 'text-teal-600', bg: 'bg-teal-50', step: 2 },
  in_progress: { icon: '🔧', label: 'In progress', color: 'text-teal-600', bg: 'bg-teal-50', step: 2 },
  completed: { icon: '✅', label: 'Completed', color: 'text-green-600', bg: 'bg-green-50', step: 3 },
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
