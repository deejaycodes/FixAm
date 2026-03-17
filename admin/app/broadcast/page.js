'use client';

import Sidebar from '../../components/Sidebar';
import { useState } from 'react';
import { mutateAPI } from '../../lib/api';

export default function Broadcast() {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    if (!confirm(`Send this to ${target === 'all' ? 'ALL users' : target}?\n\n"${message}"`)) return;
    setSending(true);
    try {
      const res = await mutateAPI('/api/requests/broadcast', { body: { message, target } });
      setResult(`✅ Queued ${res.queued} messages`);
      setMessage('');
    } catch { setResult('❌ Failed to send'); }
    setSending(false);
  };

  const templates = [
    { label: '🎉 Launch', text: '🛠️ FixAm is LIVE! Book verified artisans on WhatsApp — plumbing, electrical, AC, generators.\n\nSend "Hi" to get started!\n\nFirst job? Use code LAUNCH for ₦1,000 off 🎁' },
    { label: '💰 Promo', text: '🎁 This week only: Book any service and get ₦1,000 off!\n\nRefer a friend and you BOTH get ₦1,000 off your next job.\n\nSend "Hi" to book now!' },
    { label: '👷 Artisan', text: '💰 New jobs waiting for you on FixAm!\n\nGo online now to receive job requests. Type "online" to start.\n\nTop artisans this week earned over ₦150,000! 🏆' },
  ];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>📢 WhatsApp Broadcast</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Send messages to all customers, artisans, or both via WhatsApp.</p>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Quick Templates</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {templates.map(t => (
              <button key={t.label} onClick={() => setMessage(t.text)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9', cursor: 'pointer', fontSize: '0.85rem' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Compose Message</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['all', 'customers', 'artisans'].map(t => (
              <button key={t} onClick={() => setTarget(t)}
                style={{ padding: '0.5rem 1rem', border: target === t ? '2px solid #0d9488' : '1px solid #ddd', borderRadius: '8px', background: target === t ? '#f0fdfa' : '#fff', cursor: 'pointer', fontWeight: target === t ? 'bold' : 'normal', fontSize: '0.85rem' }}>
                {t === 'all' ? '👥 All Users' : t === 'customers' ? '🏠 Customers' : '👷 Artisans'}
              </button>
            ))}
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Type your broadcast message..."
            style={{ width: '100%', minHeight: '120px', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ color: '#999', fontSize: '0.8rem' }}>{message.length} characters</span>
            <button onClick={send} disabled={sending || !message.trim()}
              style={{ padding: '0.75rem 2rem', background: sending ? '#ccc' : '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', cursor: sending ? 'default' : 'pointer', fontWeight: 'bold' }}>
              {sending ? 'Sending...' : '📤 Send Broadcast'}
            </button>
          </div>
          {result && <p style={{ marginTop: '1rem', padding: '0.75rem', background: result.startsWith('✅') ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', fontSize: '0.9rem' }}>{result}</p>}
        </div>
      </main>
    </div>
  );
}
