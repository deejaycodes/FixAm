'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, services } from '../lib';

const promos = ['🛡️ Job Guarantee on every booking', '⚡ Emergency? Get help in 15min', '💰 Refer friends, earn ₦1,000'];

export default function Home({ nav, token, user }: { nav: (s: string, p?: any) => void; token: string; user: any }) {
  const [recent, setRecent] = useState<any>(null);

  useEffect(() => {
    api('/api/requests/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.length > 0) setRecent(r[0]); }).catch(() => {});
  }, [token]);

  return (
    <div className="animate-in pb-4">
      <div className="px-5 pt-14 pb-4 bg-gradient-to-b from-teal-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</p>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">{user?.name || 'there'} 👋</h2>
          </div>
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="w-full bg-white shadow-sm rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none" placeholder="What needs fixing?" readOnly onClick={() => {}} />
        </div>
      </div>

      <div className="px-5 mt-4 flex gap-3 overflow-x-auto no-scrollbar">
        {promos.map(p => (
          <div key={p} className="flex-shrink-0 bg-teal-50 rounded-xl px-4 py-3 text-xs font-medium text-teal-700 whitespace-nowrap">{p}</div>
        ))}
      </div>

      <div className="px-5 mt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Services</h3>
        <div className="grid grid-cols-3 gap-3">
          {services.map(s => (
            <button key={s.id} onClick={() => nav('new', { serviceType: s.id, serviceName: s.name, serviceIcon: s.icon })}
              className="flex flex-col items-center p-4 rounded-2xl shadow-sm bg-white active:scale-95 transition">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-2xl mb-2`}>{s.icon}</div>
              <span className="font-semibold text-xs text-gray-900">{s.name}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {recent && (
        <div className="px-5 mt-6 animate-in-delay">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent</h3>
          <button onClick={() => nav('status', { requestId: recent.id })}
            className="w-full bg-white shadow-sm rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-lg">
              {services.find(s => s.id === recent.serviceType)?.icon || '📋'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm capitalize text-gray-900">{recent.serviceType?.replace('_', ' ')}</p>
              <p className="text-gray-400 text-xs truncate">{recent.description}</p>
            </div>
            <span className="text-xs text-gray-300">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
