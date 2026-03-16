'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { api, services, statusMap, pillColor } from '../lib';

const promos = ['🛡️ Job Guarantee', '⚡ 15min Emergency', '💰 Refer & Earn ₦1k'];

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
                  <div>
                    <p className="text-sm font-bold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promos */}
      <div className="px-5 mt-5 flex gap-2">
        {promos.map(p => (
          <div key={p} className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-2 py-2.5 text-[10px] font-bold text-amber-800 text-center leading-tight">{p}</div>
        ))}
      </div>

      {/* Services */}
      <div className="px-5 mt-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Services</h3>
        <div className="grid grid-cols-3 gap-3">
          {services.map(s => (
            <button key={s.id} onClick={() => nav('new', { serviceType: s.id, serviceName: s.name, serviceIcon: s.icon })}
              className={`flex flex-col items-center p-4 rounded-2xl ${s.bg} shadow-md active:scale-95 transition`}>
              <span className="text-3xl mb-2 drop-shadow">{s.icon}</span>
              <span className="font-bold text-xs text-white">{s.name}</span>
              <span className="text-[10px] text-white/70 mt-0.5">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent */}
      {recent && (
        <div className="px-5 mt-6 animate-in-delay">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recent</h3>
          <button onClick={() => nav('status', { requestId: recent.id })}
            className="w-full bg-white border-2 border-gray-100 shadow-sm rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] active:border-teal-400 transition">
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
    </div>
  );
}
