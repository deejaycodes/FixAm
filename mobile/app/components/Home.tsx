'use client';
import { useState, useEffect, useRef } from 'react';
import { api, getServices, getCountry, statusMap, pillColor } from '../lib';

const basePromos = ['🛡️ Job Guarantee', '⚡ 15min Emergency'];

export default function Home({ nav, token, user }: { nav: (s: string, p?: any) => void; token: string | null; user: any }) {
  const [recent, setRecent] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const country = getCountry();
  const services = getServices();

  const reviews = country.code === 'GH' ? [
    { name: 'Kwame A.', area: 'East Legon', text: 'Electrician came within 30 minutes. Very professional work!', rating: 5 },
    { name: 'Ama O.', area: 'Osu', text: 'AC repair guy was honest about pricing. Highly recommend.', rating: 5 },
    { name: 'Kofi B.', area: 'Tema', text: 'Generator fixed on a Sunday evening. These guys deliver!', rating: 4 },
  ] : [
    { name: 'Chioma A.', area: 'Lekki', text: 'Plumber came in 20 minutes. Fixed my burst pipe same day. Lifesaver!', rating: 5 },
    { name: 'Emeka O.', area: 'Ikeja', text: 'AC guy was professional and honest about pricing. Will use again.', rating: 5 },
    { name: 'Funke B.', area: 'Surulere', text: 'Generator repair at 10pm on a Sunday. These guys are serious!', rating: 4 },
  ];

  const [popular, setPopular] = useState([
    { label: 'Generator Repair', icon: '⚙️', id: 'generator', tag: 'Most booked' },
    { label: 'AC Servicing', icon: '❄️', id: 'ac_repair', tag: 'Trending' },
    { label: 'Plumbing', icon: '🔧', id: 'plumbing', tag: 'Quick fix' },
  ]);

  useEffect(() => {
    api('/api/popular').then((data: any[]) => {
      if (data.length >= 3) {
        const svcMap: Record<string, { label: string; icon: string }> = {
          plumbing: { label: 'Plumbing', icon: '🔧' }, electrical: { label: 'Electrical', icon: '⚡' },
          ac_repair: { label: 'AC Servicing', icon: '❄️' }, generator: { label: 'Generator Repair', icon: '⚙️' },
          carpentry: { label: 'Carpentry', icon: '🪚' }, emergency: { label: 'Emergency', icon: '🚨' },
        };
        const tags = ['Most booked', 'Trending', 'Popular'];
        setPopular(data.map((d: any, i: number) => ({
          id: d.serviceType, label: svcMap[d.serviceType]?.label || d.serviceType,
          icon: svcMap[d.serviceType]?.icon || '🔧', tag: tags[i] || '',
        })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    api('/api/requests/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.length > 0) setRecent(r[0]); }).catch(() => {});
  }, [token]);

  const filtered = query.trim()
    ? services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="animate-in pb-4 bg-white min-h-screen">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          {token && user?.name ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {user.name[0].toUpperCase()}
              </div>
              <p className="text-lg font-bold text-white">Hi, {user.name.split(' ')[0]} 👋</p>
            </div>
          ) : (
            <h2 className="text-2xl font-extrabold text-white pt-1">What needs fixing?</h2>
          )}
          <span className="text-lg font-extrabold text-white">Fix<span className="text-teal-400">Am</span></span>
        </div>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input ref={inputRef}
            className="w-full bg-white rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-teal-400 shadow-md"
            placeholder="Search services..." value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} />
          {focused && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">No matching services</p>
              ) : filtered.map(s => (
                <button key={s.id} onClick={() => { setQuery(''); nav('new', { serviceType: s.id, serviceName: s.name, serviceIcon: s.icon }); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-left border-b border-gray-100 last:border-0">
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                  <span className="text-xs text-teal-600 font-bold">from {s.from}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promos */}
      <div className="px-5 mt-5 flex gap-2">
        {[...basePromos, `💰 Refer & Earn ${country.code === 'GH' ? 'GH₵15' : '₦1k'}`].map(p => (
          <div key={p} className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-2 py-2.5 text-[10px] font-bold text-amber-800 text-center leading-tight">{p}</div>
        ))}
      </div>

      {/* Popular near you */}
      <div className="px-5 mt-5">
        <h3 className="text-sm font-bold text-gray-900 mb-2">🔥 Popular near you</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {popular.map(p => (
            <button key={p.id} onClick={() => nav('new', { serviceType: p.id, serviceName: p.label, serviceIcon: p.icon })}
              className="flex-shrink-0 bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-2.5 active:scale-95 transition">
              <span className="text-xl">{p.icon}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-white">{p.label}</p>
                <p className="text-[9px] text-teal-400 font-semibold">{p.tag}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="px-5 mt-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Services</h3>
        <div className="grid grid-cols-3 gap-3">
          {services.map(s => (
            <button key={s.id} onClick={() => nav('new', { serviceType: s.id, serviceName: s.name, serviceIcon: s.icon })}
              className="flex flex-col items-center p-3.5 rounded-2xl border-2 border-gray-100 bg-white shadow-sm active:scale-95 transition">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-2xl mb-2`}>{s.icon}</div>
              <span className="font-bold text-xs text-gray-900">{s.name}</span>
              <span className="text-[10px] text-teal-600 font-semibold mt-0.5">from {s.from}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent booking */}
      {recent && (
        <div className="px-5 mt-6 animate-in-delay">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recent</h3>
          <button onClick={() => nav('status', { requestId: recent.id })}
            className="w-full bg-white border-2 border-gray-100 shadow-sm rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-lg">
              {services.find(s => s.id === recent.serviceType)?.icon || '📋'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm capitalize text-gray-900">{recent.serviceType?.replace('_', ' ')}</p>
              <p className="text-gray-500 text-xs truncate">{recent.description}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${pillColor[recent.status] || 'bg-gray-100 text-gray-600'}`}>
              {(statusMap[recent.status] || {}).label || recent.status}
            </span>
          </button>
        </div>
      )}

      {/* Social proof */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">What {country.city} is saying</h3>
          <span className="text-[10px] text-gray-400 font-semibold">1,200+ jobs done</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {reviews.map(r => (
            <div key={r.name} className="flex-shrink-0 w-64 bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{r.name[0]}</div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{r.name}</p>
                  <p className="text-[10px] text-gray-400">{r.area}</p>
                </div>
                <span className="ml-auto text-xs">{'⭐'.repeat(r.rating)}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="px-5 mt-6 mb-4">
        <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-around">
          <div className="text-center">
            <p className="text-white font-extrabold text-lg">500+</p>
            <p className="text-gray-400 text-[10px]">Verified Artisans</p>
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <div className="text-center">
            <p className="text-white font-extrabold text-lg">4.8⭐</p>
            <p className="text-gray-400 text-[10px]">Avg Rating</p>
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <div className="text-center">
            <p className="text-white font-extrabold text-lg">{country.currencySymbol}0</p>
            <p className="text-gray-400 text-[10px]">Booking Fee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
