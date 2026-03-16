'use client';
import { useState, useEffect } from 'react';
import { api, statusMap } from '../lib';

const stepLabels = ['Requested', 'Matched', 'On the way', 'Done'];

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {stepLabels.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] mt-1 font-medium ${i <= step ? 'text-teal-600' : 'text-gray-300'}`}>{label}</span>
          </div>
          {i < 3 && <div className={`flex-1 h-0.5 mx-1 mt-[-12px] ${i < step ? 'bg-teal-600' : 'bg-gray-100'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Status({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [req, setReq] = useState<any>(null);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    const load = () => api(`/api/requests/${params.requestId}`, { headers: { Authorization: `Bearer ${token}` } }).then(setReq).catch(() => {});
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [params.requestId, token]);

  if (!req) return (
    <div className="px-5 pt-16 space-y-4">
      <div className="h-8 w-48 skeleton rounded-lg" />
      <div className="h-4 w-32 skeleton rounded-lg" />
      <div className="h-32 skeleton rounded-2xl mt-4" />
    </div>
  );

  const s = statusMap[req.status] || statusMap.pending;
  const art = req.Artisan;
  const canContact = req.status === 'accepted' || req.status === 'in_progress';

  return (
    <div className="animate-in px-5 pt-16">
      <div className={`inline-flex items-center gap-2 ${s.bg} ${s.color} rounded-full px-3 py-1.5 text-xs font-semibold mb-3`}>
        <span>{s.icon}</span> {s.label}
      </div>
      <h2 className="text-xl font-bold text-gray-900 capitalize mb-6">{req.serviceType?.replace('_', ' ')}</h2>

      {s.step >= 0 && <Stepper step={s.step} />}

      {art && (
        <div className="bg-white shadow-sm rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-lg font-bold text-teal-700">
              {art.name?.[0] || 'A'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{art.name}</p>
                {art.verified && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-semibold">✓ Verified</span>}
              </div>
              <p className="text-gray-400 text-xs mt-0.5">{'⭐'.repeat(Math.round(art.rating || 0))} {art.rating}/5</p>
            </div>
          </div>
          {canContact && art.phone && (
            <div className="flex gap-2 mt-4">
              <a href={`tel:${art.phone}`} className="flex-1 bg-teal-600 text-white rounded-xl py-2.5 text-center font-semibold text-sm active:scale-[0.98] transition">
                📞 Call
              </a>
              <a href={`https://wa.me/${art.phone}`} target="_blank" className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-center font-semibold text-sm active:scale-[0.98] transition">
                💬 WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {req.estimatedPrice && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Estimated cost</span>
          <span className="font-bold text-gray-900">₦{(req.estimatedPrice / 100).toLocaleString()}</span>
        </div>
      )}

      {req.status === 'completed' && !req.rating && (
        <div className="bg-white shadow-sm rounded-2xl p-5 mb-4 text-center">
          <p className="font-semibold text-sm mb-3">How was the service?</p>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n}
                onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)}
                onClick={async () => {
                  await api(`/api/requests/${params.requestId}/rate`, { method: 'POST', body: JSON.stringify({ rating: n }), headers: { Authorization: `Bearer ${token}` } });
                  nav('home');
                }}
                className="text-3xl transition-transform hover:scale-110 active:scale-125">
                {n <= hoverStar ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>
      )}

      {(req.status === 'pending' || req.status === 'assigned') && (
        <button className="text-red-400 font-medium text-sm mt-2" onClick={async () => {
          try { await api(`/api/requests/${params.requestId}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); nav('home'); }
          catch (e: any) { alert(e.message); }
        }}>Cancel Request</button>
      )}
    </div>
  );
}
