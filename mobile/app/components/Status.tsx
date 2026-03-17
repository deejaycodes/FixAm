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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] mt-1 font-medium ${i <= step ? 'text-teal-700' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < 3 && <div className={`flex-1 h-0.5 mx-1 mt-[-12px] ${i < step ? 'bg-teal-600' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Status({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [req, setReq] = useState<any>(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    const load = () => api(`/api/requests/${params.requestId}`, { headers: { Authorization: `Bearer ${token}` } }).then(setReq).catch(() => {});
    load();
    const i = setInterval(load, 15000);
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
  const isActive = ['pending', 'assigned', 'accepted', 'in_progress'].includes(req.status);

  return (
    <div className="animate-in px-5 pt-16">
      <div className={`inline-flex items-center gap-2 ${s.bg} ${s.color} rounded-full px-3 py-1.5 text-xs font-semibold mb-3 border ${s.color.replace('text-', 'border-')}/20`}>
        <span>{s.icon}</span> {s.label}
      </div>
      <h2 className="text-xl font-bold text-gray-900 capitalize mb-1">{req.serviceType?.replace('_', ' ')}</h2>
      {req.description && <p className="text-sm text-gray-500 mb-6">{req.description}</p>}

      {s.step >= 0 && <Stepper step={s.step} />}

      {art && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
              {art.name?.[0] || 'A'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{art.name}</p>
                {art.verified && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-semibold">✓ Verified</span>}
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{'⭐'.repeat(Math.round(art.rating || 0))} {art.rating}/5</p>
            </div>
          </div>
          {canContact && art.phone && (
            <div className="flex gap-2 mt-4">
              <a href={`tel:${art.phone}`} className="flex-1 bg-teal-600 text-white rounded-xl py-2.5 text-center font-semibold text-sm active:scale-[0.98] transition shadow-md">
                📞 Call
              </a>
              <a href={`https://wa.me/${art.phone}`} target="_blank" className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-center font-semibold text-sm active:scale-[0.98] transition shadow-md">
                💬 WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {req.estimatedPrice && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-gray-600">Estimated cost</span>
          <span className="font-bold text-lg text-gray-900">₦{(req.estimatedPrice / 100).toLocaleString()}</span>
        </div>
      )}

      {isActive && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Add a note for the artisan</label>
          <div className="flex gap-2">
            <input className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200 placeholder-gray-400"
              placeholder="e.g. Gate code is 1234, ring doorbell..."
              value={note} onChange={e => { setNote(e.target.value); setNoteSaved(false); }} />
            <button onClick={() => { setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000); }}
              className="bg-teal-600 text-white rounded-xl px-4 text-sm font-semibold active:scale-95 transition shadow-sm">
              {noteSaved ? '✓' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {req.status === 'completed' && !req.rating && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-4 text-center">
          <p className="font-semibold text-sm mb-3 text-gray-800">How was the service?</p>
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
        <button className="text-red-500 font-medium text-sm mt-2" onClick={async () => {
          try { await api(`/api/requests/${params.requestId}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); nav('home'); }
          catch (e: any) { alert(e.message); }
        }}>Cancel Request</button>
      )}

      {req.status === 'completed' && req.rating && (
        <button onClick={() => nav('new', { serviceType: req.serviceType, serviceName: req.serviceType?.replace('_', ' '), serviceIcon: '🔧' })}
          className="w-full bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl py-3 text-sm font-bold mt-4 active:scale-[0.98] transition">
          🔄 Book Again
        </button>
      )}

      {req.estimatedPrice && isActive && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Payment options</p>
          <div className="flex gap-2">
            <span className="flex-1 text-center bg-white border border-gray-200 rounded-xl py-2 text-[10px] font-bold text-gray-700">💳 Paystack</span>
            <span className="flex-1 text-center bg-white border border-gray-200 rounded-xl py-2 text-[10px] font-bold text-gray-700">🏦 Transfer</span>
            <span className="flex-1 text-center bg-white border border-gray-200 rounded-xl py-2 text-[10px] font-bold text-gray-700">💵 Cash</span>
          </div>
        </div>
      )}
    </div>
  );
}
