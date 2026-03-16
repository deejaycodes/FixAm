'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { api, services, statusMap, pillColor } from '../lib';

const promos = ['🛡️ Job Guarantee on every booking', '⚡ Emergency? Get help in 15min', '💰 Refer friends, earn ₦1,000'];

export default function Home({ nav, token, user }: { nav: (s: string, p?: any) => void; token: string | null; user: any }) {
  const [recent, setRecent] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    api('/api/requests/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.length > 0) setRecent(r[0]); }).catch(() => {});
  }, [token]);

  const filtered = query.trim()
    ? services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="animate-in pb-4">
      <div className="px-5 pt-14 pb-4 bg-gradient-to-b from-teal-50 to-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 text-xs font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</p>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">{user?.name || 'there'} 👋</h2>
          </div>
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
        </div>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input ref={inputRef}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 shadow-sm"
            placeholder="What needs fixing?" value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} />
          {focused && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No matching services</p>
              ) : filtered.map(s => (
                <button key={s.id} onClick={() => { setQuery(''); nav('new', { serviceType: s.id, serviceName: s.name, serviceIcon: s.icon }); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-left border-b border-gray-50 last:border-0">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-4 flex gap-2">
        {promos.map(p => (
          <div key={p} className="flex-1 bg-teal-600/10 border border-teal-200/50 rounded-xl px-3 py-2.5 text-[10px] font-semibold text-teal-700 text-center leading-tight">{p}</div>
        ))}
      </div>

      <div className="px-5 mt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Services</h3>
        <div className="grid grid-cols-3 gap-3">
          {services.map(s => (
            <button key={s.id} onClick={() => nav('new', { serviceType: s.id, serviceName: s.name, serviceIcon: s.icon })}
              className={`flex flex-col items-center p-4 rounded-2xl border border-gray-100 shadow-sm ${s.bg} active:scale-95 transition`}>
              <div className="w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center text-2xl mb-2 shadow-sm">{s.icon}</div>
              <span className="font-semibold text-xs text-gray-900">{s.name}</span>
              <span className="text-[10px] text-gray-500 mt-0.5">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {recent && (
        <div className="px-5 mt-6 animate-in-delay">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent</h3>
          <button onClick={() => nav('status', { requestId: recent.id })}
            className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-lg">
              {services.find(s => s.id === recent.serviceType)?.icon || '📋'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm capitalize text-gray-900">{recent.serviceType?.replace('_', ' ')}</p>
              <p className="text-gray-500 text-xs truncate">{recent.description}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${pillColor[recent.status] || 'bg-gray-100 text-gray-500'}`}>
              {(statusMap[recent.status] || {}).label || recent.status}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
