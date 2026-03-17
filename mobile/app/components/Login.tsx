'use client';
import { useState } from 'react';
import { api, countries, getCountry, setCountry, CountryCode } from '../lib';

export default function Login({ onLogin }: { onLogin: (t: string, u: any) => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isReg, setIsReg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cc, setCc] = useState<CountryCode>(getCountry().code);
  const c = countries[cc];

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
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center px-6 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-teal-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-8 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Fix<span className="text-teal-400">Am</span></h1>
          <p className="text-gray-400 mt-2 text-sm">Reliable artisans, one tap away.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 mb-6 shadow-xl">
          <p className="text-gray-900 font-bold text-lg mb-4">{isReg ? 'Create Account' : 'Welcome back'}</p>
          <div className="flex gap-2 mb-3">
            {(Object.keys(countries) as CountryCode[]).map(k => (
              <button key={k} onClick={() => { setCc(k); setCountry(k); }}
                className={`flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition border-2 ${cc === k ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>
                {countries[k].flag} {countries[k].name}
              </button>
            ))}
          </div>
          {isReg && (
            <input className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3.5 mb-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 border border-gray-200"
              placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3.5 mb-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 border border-gray-200"
            placeholder={`Phone (e.g. ${c.phonePlaceholder})`} value={phone} onChange={e => setPhone(e.target.value)} type="tel"
            onKeyDown={e => e.key === 'Enter' && submit()} />
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <button onClick={submit} disabled={loading}
            className="w-full bg-teal-600 text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition shadow-md shadow-teal-600/20">
            {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isReg ? 'Create Account' : 'Log In'}
          </button>
        </div>

        <button onClick={() => setIsReg(!isReg)} className="text-gray-400 text-sm font-medium block mx-auto">
          {isReg ? 'Already have an account? Log in' : 'New here? Create account'}
        </button>

        <div className="flex justify-center gap-6 mt-10">
          {['500+ Artisans', '4.8★ Rating', '🛡️ Guaranteed'].map(t => (
            <span key={t} className="text-gray-500 text-[10px] font-medium">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
