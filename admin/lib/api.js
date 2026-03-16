const API = process.env.NEXT_PUBLIC_API_URL || '';
const API_KEY = process.env.API_KEY || '';

export async function fetchAPI(path) {
  const res = await fetch(`${API}${path}`, {
    cache: 'no-store',
    headers: API_KEY ? { 'x-api-key': API_KEY } : {},
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function mutateAPI(path, { method = 'POST', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
