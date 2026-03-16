'use client';
import { useState } from 'react';
import { api } from '../lib';

export default function NewRequest({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    try {
      let loc = { lat: 6.5244, lng: 3.3792 };
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
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
    <div className="animate-in px-5 pt-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl">{params.serviceIcon || '🔧'}</div>
        <div>
          <p className="text-xs text-gray-400 font-medium">New Request</p>
          <h2 className="text-lg font-bold text-gray-900">{params.serviceName}</h2>
        </div>
      </div>

      <label className="text-sm font-medium text-gray-700 mb-2 block">What&apos;s the problem?</label>
      <textarea className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-teal-200 min-h-[130px] resize-none placeholder-gray-300"
        placeholder="Describe the issue in detail..." value={desc} onChange={e => setDesc(e.target.value)} />

      <button className="flex items-center gap-2 mt-3 text-sm text-gray-400 font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        Add photo
      </button>

      <div className="flex items-center gap-2 mt-5 bg-green-50 rounded-xl px-4 py-3">
        <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
        <span className="text-xs text-green-700 font-medium">📍 Using your current location</span>
      </div>

      <button onClick={submit} disabled={loading}
        className="w-full bg-teal-600 text-white rounded-2xl py-4 font-bold text-sm mt-6 disabled:opacity-50 active:scale-[0.98] transition shadow-lg shadow-teal-600/20">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Finding artisan...
          </span>
        ) : 'Find Artisan →'}
      </button>
    </div>
  );
}
