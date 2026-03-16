const BASE = 'https://fixam-production.up.railway.app';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const api = {
  // Auth
  register: (phone: string, name: string) =>
    request('/api/customer/register', { method: 'POST', body: JSON.stringify({ phone, name }) }),
  login: (phone: string) =>
    request('/api/customer/login', { method: 'POST', body: JSON.stringify({ phone }) }),

  // Service requests
  createRequest: (token: string, data: { serviceType: string; description: string; location: { lat: number; lng: number }; emergency?: boolean }) =>
    request('/api/requests', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
  getMyRequests: (token: string) =>
    request('/api/requests/mine', { headers: { Authorization: `Bearer ${token}` } }),
  getRequest: (token: string, id: string) =>
    request(`/api/requests/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  rateRequest: (token: string, id: string, rating: number) =>
    request(`/api/requests/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating }), headers: { Authorization: `Bearer ${token}` } }),
  cancelRequest: (token: string, id: string) =>
    request(`/api/requests/${id}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),

  // Artisan profile
  getProfile: (slug: string) => request(`/p/${slug}`),

  // Payments
  initPayment: (token: string, requestId: string) =>
    request('/api/payments/init', { method: 'POST', body: JSON.stringify({ requestId }), headers: { Authorization: `Bearer ${token}` } }),
};
