'use client';
import { useState, useEffect, useRef } from 'react';
import { api, statusMap, formatPrice } from '../lib';

const stepLabels = ['Requested', 'Matched', 'Accepted', 'On the way', 'Done'];

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
          {i < 4 && <div className={`flex-1 h-0.5 mx-1 mt-[-12px] ${i < step ? 'bg-teal-600' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Status({ nav, token, params }: { nav: (s: string, p?: any) => void; token: string; params: any }) {
  const [req, setReq] = useState<any>(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgText, setMsgText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => api(`/api/requests/${params.requestId}`, { headers: { Authorization: `Bearer ${token}` } }).then(setReq).catch(() => {});
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [params.requestId, token]);

  useEffect(() => {
    if (!showChat) return;
    const load = () => api(`/api/requests/${params.requestId}/messages`, { headers: { Authorization: `Bearer ${token}` } }).then(setMessages).catch(() => {});
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [showChat, params.requestId, token]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = async () => {
    if (!msgText.trim()) return;
    await api(`/api/requests/${params.requestId}/messages`, {
      method: 'POST', body: JSON.stringify({ text: msgText.trim() }),
      headers: { Authorization: `Bearer ${token}` },
    });
    setMsgText('');
    const msgs = await api(`/api/requests/${params.requestId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    setMessages(msgs);
  };

  const acceptQuote = async (quoteId: string) => {
    await api(`/api/requests/${params.requestId}/quotes/${quoteId}/accept`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await api(`/api/requests/${params.requestId}`, { headers: { Authorization: `Bearer ${token}` } });
    setReq(updated);
  };

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
  const quotes = req.Quotes?.filter((q: any) => q.status === 'pending') || [];
  const portfolio = art?.portfolioPhotos || [];

  // Chat overlay
  if (showChat) return (
    <div className="animate-in flex flex-col h-screen bg-white">
      <div className="px-5 pt-14 pb-3 bg-gray-900 flex items-center gap-3">
        <button onClick={() => setShowChat(false)} className="text-white text-lg">←</button>
        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
          {art?.name?.[0] || 'A'}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{art?.name || 'Artisan'}</p>
          <p className="text-[10px] text-gray-400">In-app messages</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && <p className="text-center text-gray-400 text-xs mt-8">No messages yet. Say hello!</p>}
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${m.sender === 'customer' ? 'bg-teal-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
              {m.text}
              <p className={`text-[9px] mt-1 ${m.sender === 'customer' ? 'text-teal-200' : 'text-gray-400'}`}>
                {new Date(m.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEnd} />
      </div>
      <div className="px-4 pb-safe pt-2 border-t border-gray-100 flex gap-2">
        <input className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
          placeholder="Type a message..." value={msgText} onChange={e => setMsgText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMsg()} />
        <button onClick={sendMsg} className="bg-teal-600 text-white rounded-xl px-4 font-bold text-sm active:scale-95 transition">Send</button>
      </div>
    </div>
  );

  // Portfolio overlay
  if (showPortfolio && portfolio.length > 0) return (
    <div className="animate-in px-5 pt-16">
      <button onClick={() => setShowPortfolio(false)} className="text-sm text-gray-500 font-medium mb-4">← Back</button>
      <h2 className="text-lg font-bold text-gray-900 mb-4">{art?.name}&apos;s Past Work</h2>
      <div className="grid grid-cols-2 gap-2">
        {portfolio.map((p: string, i: number) => (
          <img key={i} src={p} className="w-full aspect-square object-cover rounded-xl border border-gray-100" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-in px-5 pt-16">
      <div className={`inline-flex items-center gap-2 ${s.bg} ${s.color} rounded-full px-3 py-1.5 text-xs font-semibold mb-3 border ${s.color.replace('text-', 'border-')}/20`}>
        <span>{s.icon}</span> {s.label}
      </div>
      <h2 className="text-xl font-bold text-gray-900 capitalize mb-1">{req.serviceType?.replace('_', ' ')}</h2>
      {req.description && <p className="text-sm text-gray-500 mb-2">{req.description}</p>}
      {req.scheduledAt && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-4 inline-block">
          📅 Scheduled: {new Date(req.scheduledAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}

      {s.step >= 0 && <Stepper step={s.step} />}

      {/* ETA */}
      {req.eta && isActive && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">🚗</span>
          <div>
            <p className="text-sm font-bold text-teal-800">Arriving in ~{req.eta} min</p>
            <p className="text-[10px] text-teal-600">Based on live location</p>
          </div>
        </div>
      )}

      {/* Multi-quote selection */}
      {quotes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">💰 Quotes from artisans</h3>
          <div className="space-y-2">
            {quotes.map((q: any) => (
              <div key={q.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {q.Artisan?.name?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-gray-900">{q.Artisan?.name}</p>
                    {q.Artisan?.verified && <span className="text-[8px] bg-teal-100 text-teal-700 px-1 py-0.5 rounded-full font-semibold">✓</span>}
                  </div>
                  <p className="text-xs text-gray-500">⭐ {q.Artisan?.rating}/5 · {q.Artisan?.totalJobs} jobs</p>
                  {q.message && <p className="text-xs text-gray-600 mt-1 truncate">{q.message}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-700">{formatPrice(q.price)}</p>
                  <button onClick={() => acceptQuote(q.id)}
                    className="bg-teal-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg mt-1 active:scale-95 transition">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artisan card */}
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
              <p className="text-gray-500 text-xs mt-0.5">{'⭐'.repeat(Math.round(art.rating || 0))} {art.rating}/5 · {art.totalJobs} jobs</p>
            </div>
          </div>

          {/* Portfolio preview */}
          {portfolio.length > 0 && (
            <button onClick={() => setShowPortfolio(true)} className="w-full mt-3">
              <div className="flex gap-1.5 overflow-hidden rounded-xl">
                {portfolio.slice(0, 3).map((p: string, i: number) => (
                  <img key={i} src={p} className="flex-1 h-16 object-cover rounded-lg border border-gray-100" />
                ))}
              </div>
              <p className="text-[10px] text-teal-600 font-semibold mt-1.5">📸 View {portfolio.length} past work photos →</p>
            </button>
          )}

          {/* Contact + Chat buttons */}
          {canContact && (
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowChat(true)}
                className="flex-1 bg-teal-600 text-white rounded-xl py-2.5 text-center font-semibold text-sm active:scale-[0.98] transition shadow-md">
                💬 Chat
              </button>
              {art.phone && (
                <a href={`tel:${art.phone}`} className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-center font-semibold text-sm active:scale-[0.98] transition">
                  📞 Call
                </a>
              )}
              {art.phone && (
                <a href={`https://wa.me/${art.phone}`} target="_blank" className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-center font-semibold text-sm active:scale-[0.98] transition shadow-md">
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {req.estimatedPrice && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-gray-600">Estimated cost</span>
          <span className="font-bold text-lg text-gray-900">{formatPrice(req.estimatedPrice)}</span>
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
          <div className="grid grid-cols-2 gap-2">
            <button onClick={async () => {
              try {
                const { url } = await api(`/api/requests/${params.requestId}/escrow`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                window.open(url, '_blank');
              } catch { /* not configured */ }
            }} className="text-center bg-teal-50 border-2 border-teal-200 rounded-xl py-2.5 text-[10px] font-bold text-teal-700 active:scale-95 transition">
              🛡️ Secure Pay
              <span className="block text-[8px] font-medium text-teal-500 mt-0.5">Held until job done</span>
            </button>
            <button onClick={async () => {
              try {
                const { url } = await api(`/api/requests/${params.requestId}/pay`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                window.open(url, '_blank');
              } catch { /* not configured */ }
            }} className="text-center bg-white border border-gray-200 rounded-xl py-2.5 text-[10px] font-bold text-gray-700 active:scale-95 transition">💳 Pay Online</button>
            <button onClick={async () => {
              try {
                const { url } = await api(`/api/requests/${params.requestId}/transfer`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                window.open(url, '_blank');
              } catch { /* not configured */ }
            }} className="text-center bg-white border border-gray-200 rounded-xl py-2.5 text-[10px] font-bold text-gray-700 active:scale-95 transition">🏦 Transfer</button>
            <span className="text-center bg-white border border-gray-200 rounded-xl py-2.5 text-[10px] font-bold text-gray-700">💵 Cash</span>
          </div>
        </div>
      )}
    </div>
  );
}
