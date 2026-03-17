'use client';
import { useState, useRef } from 'react';
import { api } from '../lib';

const urgencyOptions = [
  { id: 'now', label: '🔴 Now', desc: 'ASAP' },
  { id: 'today', label: '🟡 Today', desc: 'Within hours' },
  { id: 'flexible', label: '🟢 Flexible', desc: 'This week' },
];

export default function NewRequest({ nav, token, user, params, onNeedAuth }: {
  nav: (s: string, p?: any) => void; token: string | null; user: any; params: any;
  onNeedAuth: (token: string, user: any) => void;
}) {
  const [desc, setDesc] = useState('');
  const [note, setNote] = useState('');
  const [urgency, setUrgency] = useState('today');
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authErr, setAuthErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (reader.result) setPhotos(p => [...p, reader.result as string]); };
    reader.readAsDataURL(file);
  };

  const doSubmit = async (t: string) => {
    setLoading(true);
    try {
      let loc = { lat: 6.5244, lng: 3.3792 };
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch {}
      }
      const fullDesc = [
        desc.trim(),
        note.trim() ? `Additional notes: ${note.trim()}` : '',
        address.trim() ? `Address: ${address.trim()}` : '',
        `Urgency: ${urgency}`,
      ].filter(Boolean).join('\n\n');
      const res = await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ serviceType: params.serviceType, description: fullDesc, location: loc, emergency: urgency === 'now' || params.serviceType === 'emergency' }),
        headers: { Authorization: `Bearer ${t}` },
      });
      // Upload photos if any
      for (const photo of photos) {
        await api(`/api/requests/${res.id}/photo`, {
          method: 'POST', body: JSON.stringify({ photo }),
          headers: { Authorization: `Bearer ${t}` },
        }).catch(() => {});
      }
      nav('status', { requestId: res.id });
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  };

  const submit = async () => {
    if (!desc.trim()) return;
    if (!token) { setShowAuth(true); return; }
    setShowConfirm(true);
  };

  const confirmSubmit = () => doSubmit(token!);

  const quickRegister = async () => {
    if (!phone.trim() || phone.length < 10) { setAuthErr('Enter a valid phone number'); return; }
    setAuthErr('');
    setLoading(true);
    try {
      let res;
      try { res = await api('/api/customer/login', { method: 'POST', body: JSON.stringify({ phone: phone.trim() }) }); }
      catch { res = await api('/api/customer/register', { method: 'POST', body: JSON.stringify({ phone: phone.trim(), name: name.trim() || undefined }) }); }
      onNeedAuth(res.token, res.customer);
      await doSubmit(res.token);
    } catch (e: any) { setAuthErr(e.message); setLoading(false); }
  };

  if (showConfirm && !showAuth) return (
    <div className="animate-in px-5 pt-16">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm your request</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between"><span className="text-sm text-gray-500">Service</span><span className="text-sm font-bold text-gray-900">{params.serviceIcon} {params.serviceName}</span></div>
        <div className="flex justify-between"><span className="text-sm text-gray-500">Urgency</span><span className="text-sm font-bold text-gray-900">{urgencyOptions.find(u => u.id === urgency)?.label}</span></div>
        {address && <div className="flex justify-between"><span className="text-sm text-gray-500">Address</span><span className="text-sm font-bold text-gray-900 text-right max-w-[60%]">{address}</span></div>}
        {photos.length > 0 && <div className="flex justify-between"><span className="text-sm text-gray-500">Photos</span><span className="text-sm font-bold text-gray-900">{photos.length} attached</span></div>}
        <div className="border-t border-gray-200 pt-3"><p className="text-sm text-gray-700">{desc}</p></div>
        {note && <p className="text-xs text-gray-500 italic">{note}</p>}
      </div>
      <button onClick={confirmSubmit} disabled={loading}
        className="w-full bg-teal-600 text-white rounded-2xl py-4 font-bold text-sm mt-6 disabled:opacity-40 active:scale-[0.98] transition shadow-lg shadow-teal-600/20">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Finding artisan...
          </span>
        ) : 'Confirm & Find Artisan →'}
      </button>
      <button onClick={() => setShowConfirm(false)} className="w-full text-gray-500 text-sm font-medium mt-3 py-2">← Edit request</button>
    </div>
  );

  return (
    <div className="animate-in px-5 pt-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-2xl">{params.serviceIcon || '🔧'}</div>
        <div>
          <p className="text-xs text-gray-500 font-medium">New Request</p>
          <h2 className="text-lg font-bold text-gray-900">{params.serviceName}</h2>
        </div>
      </div>

      <label className="text-sm font-semibold text-gray-800 mb-2 block">When do you need this?</label>
      <div className="flex gap-2 mb-5">
        {urgencyOptions.map(u => (
          <button key={u.id} onClick={() => setUrgency(u.id)}
            className={`flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition border-2 ${urgency === u.id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-100 bg-white text-gray-500'}`}>
            {u.label}
            <span className="block text-[9px] font-medium mt-0.5 opacity-70">{u.desc}</span>
          </button>
        ))}
      </div>

      <label className="text-sm font-semibold text-gray-800 mb-2 block">What&apos;s the problem?</label>
      <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 min-h-[100px] resize-none placeholder-gray-400 shadow-sm"
        placeholder="e.g. My kitchen tap is leaking badly..." value={desc} onChange={e => setDesc(e.target.value)} />

      <label className="text-sm font-semibold text-gray-800 mt-4 mb-2 block">Additional notes <span className="text-gray-400 font-normal">(optional)</span></label>
      <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 min-h-[60px] resize-none placeholder-gray-400 shadow-sm"
        placeholder="Budget range, preferred time, access instructions..." value={note} onChange={e => setNote(e.target.value)} />

      {/* Location */}
      <label className="text-sm font-semibold text-gray-800 mt-4 mb-2 block">Location</label>
      <div className="flex items-center gap-2 bg-green-50 border border-green-200/50 rounded-xl px-4 py-3 mb-2">
        <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
        <span className="text-xs text-green-700 font-medium">📍 Using your GPS location</span>
      </div>
      <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-200 placeholder-gray-400 shadow-sm"
        placeholder="Or type: e.g. Opposite Shoprite, Ikeja" value={address} onChange={e => setAddress(e.target.value)} />

      {/* Photos */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={addPhoto} />
      <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 mt-4 text-sm text-teal-600 font-semibold active:opacity-70 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        📸 Add photo {photos.length > 0 && `(${photos.length})`}
      </button>
      {photos.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
          {photos.map((p, i) => (
            <div key={i} className="relative flex-shrink-0">
              <img src={p} className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100" />
              <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
            </div>
          ))}
        </div>
      )}

      {showAuth && !token && (
        <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-in">
          <p className="text-sm font-semibold text-gray-800 mb-3">Quick sign up to continue</p>
          <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200 mb-2 placeholder-gray-400"
            placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200 placeholder-gray-400"
            placeholder="Phone number *" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && quickRegister()} />
          {authErr && <p className="text-red-500 text-xs mt-2">{authErr}</p>}
          <button onClick={quickRegister} disabled={loading}
            className="w-full bg-teal-600 text-white rounded-xl py-3 font-bold text-sm mt-3 disabled:opacity-40 active:scale-[0.98] transition">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Finding artisan...
              </span>
            ) : 'Continue & Find Artisan →'}
          </button>
        </div>
      )}

      {!showAuth && (
        <button onClick={submit} disabled={loading || !desc.trim()}
          className="w-full bg-teal-600 text-white rounded-2xl py-4 font-bold text-sm mt-6 disabled:opacity-40 active:scale-[0.98] transition shadow-lg shadow-teal-600/20">
          Review & Submit →
        </button>
      )}
    </div>
  );
}
