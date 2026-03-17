'use client';
import { useState } from 'react';
import { api, getCountry } from '../lib';

export default function Profile({ user, logout, onUpdateUser }: { user: any; logout: () => void; onUpdateUser?: (u: any) => void }) {
  const [copied, setCopied] = useState(false);
  const [screen, setScreen] = useState<'main' | 'edit' | 'help'>('main');
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const initials = (user?.name || 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const c = getCountry();
  const reward = c.code === 'GH' ? 'GH₵15' : '₦1,000';

  const copyCode = () => {
    navigator.clipboard?.writeText(user?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = JSON.parse(localStorage.getItem('fixam_auth') || '{}').token;
      const updated = await api('/api/requests/profile', { method: 'PUT', body: JSON.stringify({ name: editName, phone: editPhone }), headers: { Authorization: `Bearer ${token}` } });
      onUpdateUser?.(updated);
      setSaved(true);
      setTimeout(() => { setSaved(false); setScreen('main'); }, 1500);
    } catch {}
    setSaving(false);
  };

  if (screen === 'edit') return (
    <div className="animate-in px-5 pt-14">
      <button onClick={() => setScreen('main')} className="text-sm text-gray-500 font-medium mb-4">← Back</button>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Name</label>
      <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-200 mb-4"
        value={editName} onChange={e => setEditName(e.target.value)} />
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone</label>
      <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-200 mb-6"
        value={editPhone} onChange={e => setEditPhone(e.target.value)} type="tel" />
      <button onClick={saveProfile} disabled={saving}
        className="w-full bg-teal-600 text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition shadow-md">
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  if (screen === 'help') return (
    <div className="animate-in px-5 pt-14">
      <button onClick={() => setScreen('main')} className="text-sm text-gray-500 font-medium mb-4">← Back</button>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Help & Support</h2>
      <div className="space-y-3">
        {[
          { q: 'How do I book an artisan?', a: 'Tap any service on the home screen, describe your problem, and we\'ll match you with a verified artisan nearby.' },
          { q: 'How do I pay?', a: 'You can pay online (card/transfer via Paystack), or pay cash directly to the artisan after the job.' },
          { q: 'What if I\'m not satisfied?', a: 'FixAm offers a job guarantee. If you\'re not happy, we\'ll send another artisan for free.' },
          { q: 'How do I cancel a request?', a: 'Go to your active request and tap "Cancel Request" at the bottom. You can cancel before the artisan is en route.' },
          { q: 'Is my payment secure?', a: 'Yes. All online payments go through Paystack, a PCI-DSS certified payment processor.' },
        ].map(faq => (
          <details key={faq.q} className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            <summary className="px-4 py-3.5 text-sm font-semibold text-gray-900 cursor-pointer">{faq.q}</summary>
            <p className="px-4 pb-3.5 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-600 mb-2">Still need help?</p>
        <a href={`https://wa.me/${c.whatsapp}?text=Hi, I need help with FixAm`} target="_blank"
          className="inline-block bg-green-600 text-white rounded-xl px-6 py-2.5 text-sm font-bold active:scale-95 transition">
          💬 Chat with Support
        </a>
      </div>
    </div>
  );

  return (
    <div className="animate-in px-5 pt-14">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-600/20">
          {initials}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-3">{user?.name || 'Customer'}</h2>
        <p className="text-gray-400 text-sm">{user?.phone}</p>
      </div>

      {user?.referralCode && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-teal-700 mb-2">🎁 Refer & Earn {reward}</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-teal-700 tracking-wider">{user.referralCode}</div>
            <button onClick={copyCode} className="bg-teal-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-95 transition">
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Use my FixAm code ${user.referralCode} and get ${reward} off your first artisan booking! Download: https://out-one-red.vercel.app`)}`, '_blank')}
            className="w-full bg-green-600 text-white rounded-xl py-2.5 text-sm font-bold active:scale-95 transition">
            💬 Share on WhatsApp
          </button>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-2xl divide-y divide-gray-50">
        <button onClick={() => setScreen('edit')} className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-gray-50 transition">
          <span className="text-lg">👤</span>
          <span className="flex-1 text-sm font-medium text-gray-700">Edit Profile</span>
          <span className="text-gray-300 text-xs">→</span>
        </button>
        <button onClick={() => setScreen('help')} className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-gray-50 transition">
          <span className="text-lg">❓</span>
          <span className="flex-1 text-sm font-medium text-gray-700">Help & Support</span>
          <span className="text-gray-300 text-xs">→</span>
        </button>
      </div>

      <button onClick={logout} className="w-full mt-4 py-3 text-red-400 font-semibold text-sm">Log Out</button>
      <p className="text-center text-gray-200 text-[10px] mt-4">FixAm v1.1.0 · {c.flag} {c.name}</p>
    </div>
  );
}
