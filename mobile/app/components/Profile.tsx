'use client';
import { useState } from 'react';

export default function Profile({ user, logout }: { user: any; logout: () => void }) {
  const [copied, setCopied] = useState(false);
  const initials = (user?.name || 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const copyCode = () => {
    navigator.clipboard?.writeText(user?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <p className="text-xs font-semibold text-teal-700 mb-2">🎁 Refer & Earn ₦1,000</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-teal-700 tracking-wider">{user.referralCode}</div>
            <button onClick={copyCode} className="bg-teal-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-95 transition">
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Use my FixAm code ${user.referralCode} and get ₦1,000 off your first artisan booking! Download: https://out-one-red.vercel.app`)}`, '_blank')}
            className="w-full bg-green-600 text-white rounded-xl py-2.5 text-sm font-bold active:scale-95 transition">
            💬 Share on WhatsApp
          </button>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-2xl divide-y divide-gray-50">
        {[
          { icon: '👤', label: 'Edit Profile' },
          { icon: '💳', label: 'Payment Methods' },
          { icon: '❓', label: 'Help & Support' },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-gray-50 transition">
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
            <span className="text-gray-300 text-xs">→</span>
          </button>
        ))}
      </div>

      <button onClick={logout} className="w-full mt-4 py-3 text-red-400 font-semibold text-sm">Log Out</button>
      <p className="text-center text-gray-200 text-[10px] mt-4">FixAm v1.0.0</p>
    </div>
  );
}
