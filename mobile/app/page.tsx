'use client';
import { useState, useEffect, useCallback } from 'react';

const API = 'https://fixam-production.up.railway.app';

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Error ${res.status}`); }
  return res.json();
}

const services = [
  { id: 'plumbing', icon: '🔧', name: 'Plumbing', desc: 'Pipes, taps, drainage' },
  { id: 'electrical', icon: '⚡', name: 'Electrical', desc: 'Wiring, sockets, lights' },
  { id: 'ac_repair', icon: '❄️', name: 'AC Repair', desc: 'Servicing, gas, install' },
  { id: 'generator', icon: '⚙️', name: 'Generator', desc: 'Repairs & servicing' },
  { id: 'carpentry', icon: '🪚', name: 'Carpentry', desc: 'Furniture, doors' },
  { id: 'emergency', icon: '🚨', name: 'Emergency', desc: 'Urgent — 1.5x rate' },
];

const statusMap: Record<string, { icon: string; label: string }> = {
  pending: { icon: '🔍', label: 'Finding artisan...' },
  assigned: { icon: '⏳', label: 'Waiting for artisan' },
  accepted: { icon: '🚗', label: 'Artisan on the way!' },
  in_progress: { icon: '🔧', label: 'Job in progress' },
  completed: { icon: '✅', label: 'Job completed' },
  cancelled: { icon: '❌', label: 'Cancelled' },
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState<any>({});

  useEffect(() => {
    const d = localStorage.getItem('fixam_auth');
    if (d) { const p = JSON.parse(d); setToken(p.token); setUser(p.user); }
  }, []);

  const login = (t: string, u: any) => { setToken(t); setUser(u); localStorage.setItem('fixam_auth', JSON.stringify({ token: t, user: u })); };
  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('fixam_auth'); setScreen('home'); };
  const nav = (s: string, p?: any) => { setScreen(s); if (p) setParams(p); };

  if (!token) return <LoginScreen onLogin={login} />;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white relative">
      <div className="flex-1 overflow-y-auto pb-20">
        {screen === 'home' && <HomeScreen nav={nav} user={user} />}
        {screen === 'new' && <NewRequestScreen nav={nav} token={token} params={params} />}
        {screen === 'status' && <StatusScreen nav={nav} token={token} params={params} />}
        {screen === 'activity' && <ActivityScreen nav={nav} token={token} />}
        {screen === 'profile' && <ProfileScreen user={user} logout={logout} />}
      </div>
      {['new', 'status'].includes(screen) && (
        <button onClick={() => nav('home')} className="absolute top-4 left-4 z-10 text-primary font-semibold text-sm">← Back</button>
      )}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex">
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'activity', icon: '📋', label: 'Activity' },
          { id: 'profile', icon: '👤', label: 'Profile' },
        ].map(t => (
          <button key={t.id} onClick={() => nav(t.id)} className={`flex-1 py-3 flex flex-col items-center gap-0.5 ${screen === t.id ? 'text-primary' : 'text-gray-400'}`}>
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (t: string, u: any) => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isReg, setIsReg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!phone.trim()) return;
    setLoading(true); setError('');
    try {
      const res = isReg
        ? await api('/api/customer/register', { method: 'POST', body: JSON.stringify({ phone: phone.trim(), name: name.trim() || 'Customer' }) })
        : await api('/api/customer/login', { method: 'POST', body: JSON.stringify({ phone: phone.trim() }) });
      onLogin(res.token, res.customer);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-md mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold">Fix<span className="text-primary">Am</span></h1>
        <p className="text-gray-400 mt-1">Reliable artisans, one tap away.</p>
      </div>
      {isReg && <input className="w-full border border-gray-200 rounded-xl px-4 py-3.5 mb-3 text-sm outline-none focus:border-primary" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />}
      <input className="w-full border border-gray-200 rounded-xl px-4 py-3.5 mb-3 text-sm outline-none focus:border-primary" placeholder="Phone (e.g. 08012345678)" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
      <button onClick={submit} disabled={loading} className="w-full bg-primary text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-50">
        {loading ? '...' : isReg ? 'Sign Up' : 'Log In'}
      </button>
      <button onClick={() => setIsReg(!isReg)} className="mt-4 text-primary text-sm font-medium">
        {isReg ? 'Already have an account? Log in' : 'New here? Create account'}
      </button>
    </div>
  );
}

function HomeScreen({ nav, user }: { nav: (s: string, p?: any) => void; user: any }) {
  return (
    <div className="px-5 pt-14">
      <p className="text-gray-400 text-sm">Hello {user?.name || ''} 👋</p>
      <h2 className="text-2xl font-bold mt-1 mb-6">What needs fixing?</h2>
      <div className="grid grid-cols-2 gap-3">
        {services.map(s => (
          <button key={s.id} onClick={() => nav('new', { serviceType: s.id, serviceName: s.name })}
            className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center hover:border-primary/40 transition active:scale-95">
            <span className="text-3xl block mb-2">{s.icon}</span>
            <span className="font-semibold text-sm text-gray-900">{s.name}</span>
            <span className="text-[11px] text-gray-400 block mt-0.5">{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NewRequestScreen({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    try {
      let loc = { lat: 6.5244, lng: 3.3792 }; // default Lagos
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
          loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch {}
      }
      const res = await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ serviceType: params.serviceType, description: desc.trim(), location: loc, emergency: params.serviceType === 'emergency' }),
        headers: { Authorization: `Bearer ${token}` },
      });
      nav('status', { requestId: res.id });
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  };

  return (
    <div className="px-5 pt-14">
      <p className="text-primary font-semibold text-sm">{params.serviceName}</p>
      <h2 className="text-2xl font-bold mt-1 mb-5">Describe the problem</h2>
      <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary min-h-[120px] resize-none"
        placeholder="e.g. My kitchen tap is leaking badly..." value={desc} onChange={e => setDesc(e.target.value)} />
      <button onClick={submit} disabled={loading} className="w-full bg-primary text-white rounded-xl py-3.5 font-bold text-sm mt-4 disabled:opacity-50 active:scale-[0.98]">
        {loading ? 'Finding artisan...' : 'Find Artisan'}
      </button>
    </div>
  );
}

function StatusScreen({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [req, setReq] = useState<any>(null);

  useEffect(() => {
    const load = () => api(`/api/requests/${params.requestId}`, { headers: { Authorization: `Bearer ${token}` } }).then(setReq).catch(() => {});
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [params.requestId, token]);

  if (!req) return <div className="pt-20 text-center text-gray-400">Loading...</div>;

  const s = statusMap[req.status] || { icon: '📋', label: req.status };
  const art = req.Artisan;
  const canCall = req.status === 'accepted' || req.status === 'in_progress';

  return (
    <div className="px-5 pt-14">
      <p className="text-primary font-semibold text-sm capitalize">{req.serviceType}</p>
      <h2 className="text-2xl font-bold mt-1 mb-6">{s.icon} {s.label}</h2>

      {art && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-5">
          <p className="font-bold text-lg">{art.name}</p>
          <p className="text-gray-400 text-sm mt-1">⭐ {art.rating}/5</p>
          {canCall && art.phone && (
            <a href={`tel:${art.phone}`} className="block bg-primary text-white rounded-xl py-3 text-center font-bold text-sm mt-3">
              📞 Call {art.phone}
            </a>
          )}
          {art.liveLocation && (
            <a href={`https://maps.google.com/?q=${art.liveLocation.lat},${art.liveLocation.lng}`} target="_blank" className="block text-primary font-semibold text-sm mt-3">
              📍 Track location
            </a>
          )}
        </div>
      )}

      {req.estimatedPrice && <p className="text-sm font-semibold mb-5">Estimated: ₦{(req.estimatedPrice / 100).toLocaleString()}</p>}

      {req.status === 'completed' && !req.rating && (
        <div className="mb-5">
          <p className="font-semibold mb-2">Rate this job:</p>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} className="text-2xl active:scale-110" onClick={async () => {
                await api(`/api/requests/${params.requestId}/rate`, { method: 'POST', body: JSON.stringify({ rating: n }), headers: { Authorization: `Bearer ${token}` } });
                alert('Thanks!'); nav('home');
              }}>⭐</button>
            ))}
          </div>
        </div>
      )}

      {(req.status === 'pending' || req.status === 'assigned') && (
        <button className="text-red-500 font-semibold text-sm" onClick={async () => {
          try { await api(`/api/requests/${params.requestId}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); nav('home'); }
          catch (e: any) { alert(e.message); }
        }}>Cancel Request</button>
      )}
    </div>
  );
}

function ActivityScreen({ nav, token }: { nav: (s: string, p?: any) => void; token: string }) {
  const [reqs, setReqs] = useState<any[]>([]);
  const load = useCallback(async () => { try { setReqs(await api('/api/requests/mine', { headers: { Authorization: `Bearer ${token}` } })); } catch {} }, [token]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="px-5 pt-14">
      <h2 className="text-2xl font-bold mb-5">My Requests</h2>
      {reqs.length === 0 && <p className="text-gray-400 text-center mt-10">No requests yet</p>}
      {reqs.map(r => (
        <button key={r.id} onClick={() => nav('status', { requestId: r.id })}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 mb-2 flex items-center gap-3 text-left hover:border-primary/30 transition">
          <span className="text-xl">{(statusMap[r.status] || {}).icon || '📋'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm capitalize">{r.serviceType}</p>
            <p className="text-gray-400 text-xs truncate">{r.description}</p>
          </div>
          <span className="text-[11px] text-gray-400 capitalize">{r.status}</span>
        </button>
      ))}
    </div>
  );
}

function ProfileScreen({ user, logout }: { user: any; logout: () => void }) {
  return (
    <div className="px-5 pt-14">
      <h2 className="text-2xl font-bold mb-5">Profile</h2>
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
        <p className="font-bold text-lg">{user?.name || 'Customer'}</p>
        <p className="text-gray-400 text-sm mt-1">{user?.phone}</p>
        {user?.referralCode && <p className="text-primary text-sm font-medium mt-2">Referral: {user.referralCode}</p>}
      </div>
      <button onClick={logout} className="mt-5 text-red-500 font-semibold text-sm">Log Out</button>
    </div>
  );
}
