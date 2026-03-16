'use client';
import { useState } from 'react';
import { api } from '../lib';

export default function Login({ onLogin }: { onLogin: (t: string, u: any) => void }) {
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
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-teal-700/30 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-8 w-40 h-40 bg-teal-600/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Fix<span className="text-teal-300">Am</span></h1>
          <p className="text-teal-300/70 mt-2 text-sm">Reliable artisans, one tap away.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6">
          {isReg && (
            <input className="w-full bg-white/10 text-white placeholder-teal-300/50 rounded-xl px-4 py-3.5 mb-3 text-sm outline-none focus:ring-2 focus:ring-teal-400/50 border border-white/10"
              placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input className="w-full bg-white/10 text-white placeholder-teal-300/50 rounded-xl px-4 py-3.5 mb-3 text-sm outline-none focus:ring-2 focus:ring-teal-400/50 border border-white/10"
            placeholder="Phone (e.g. 08012345678)" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
          <button onClick={submit} disabled={loading}
            className="w-full bg-teal-400 text-teal-900 rounded-xl py-3.5 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition">
            {loading ? <span className="inline-block w-5 h-5 border-2 border-teal-900/30 border-t-teal-900 rounded-full animate-spin" /> : isReg ? 'Create Account' : 'Log In'}
          </button>
        </div>

        <button onClick={() => setIsReg(!isReg)} className="text-teal-300/70 text-sm font-medium block mx-auto">
          {isReg ? 'Already have an account? Log in' : 'New here? Create account'}
        </button>

        <div className="flex justify-center gap-6 mt-10">
          {['500+ Artisans', '4.8★ Rating', '🛡️ Guaranteed'].map(t => (
            <span key={t} className="text-teal-400/60 text-[10px] font-medium">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
