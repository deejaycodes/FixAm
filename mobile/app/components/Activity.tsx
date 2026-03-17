'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, services, statusMap, pillColor } from '../lib';

function timeGroup(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 1) return 'Today';
  if (diff < 7) return 'This Week';
  return 'Earlier';
}

export default function Activity({ nav, token }: { nav: (s: string, p?: any) => void; token: string }) {
  const [reqs, setReqs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { try { setReqs(await api('/api/requests/mine', { headers: { Authorization: `Bearer ${token}` } })); } catch {} }, [token]);
  useEffect(() => { load(); }, [load]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const grouped = reqs.reduce((acc: Record<string, any[]>, r) => {
    const g = timeGroup(r.createdAt);
    (acc[g] = acc[g] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="animate-in px-5 pt-14">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Activity</h2>
        <button onClick={refresh} className={`text-xs text-teal-600 font-semibold ${refreshing ? 'opacity-50' : ''}`}>
          {refreshing ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>
      {reqs.length === 0 && (
        <div className="text-center mt-16">
          <span className="text-4xl block mb-3">📋</span>
          <p className="text-gray-500 text-sm">No requests yet</p>
          <button onClick={() => nav('home')} className="text-teal-600 text-sm font-semibold mt-2">Book your first artisan →</button>
        </div>
      )}
      {['Today', 'This Week', 'Earlier'].map(group => grouped[group] && (
        <div key={group} className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group}</p>
          {grouped[group].map((r: any) => {
            const svc = services.find(s => s.id === r.serviceType);
            return (
              <div key={r.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mb-2">
                <button onClick={() => nav('status', { requestId: r.id })}
                  className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                    {svc?.icon || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm capitalize text-gray-900">{r.serviceType?.replace('_', ' ')}</p>
                    <p className="text-gray-500 text-[11px] truncate">{r.description}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${pillColor[r.status] || 'bg-gray-100 text-gray-600'}`}>
                    {(statusMap[r.status] || {}).label || r.status}
                  </span>
                </button>
                {r.status === 'completed' && (
                  <button onClick={() => nav('new', { serviceType: r.serviceType, serviceName: svc?.name || r.serviceType, serviceIcon: svc?.icon || '🔧' })}
                    className="mt-3 w-full bg-teal-50 border border-teal-200 text-teal-700 rounded-xl py-2 text-xs font-bold active:scale-[0.98] transition">
                    🔄 Book Again
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
