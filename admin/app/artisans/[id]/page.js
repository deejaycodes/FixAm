import Sidebar from '../../../components/Sidebar';
import { fetchAPI } from '../../../lib/api';
import Link from 'next/link';
import ArtisanDetailActions from './actions';

export default async function ArtisanDetail({ params }) {
  const { id } = await params;
  let artisan = null, requests = [];
  try {
    const [artisans, allRequests] = await Promise.all([
      fetchAPI('/api/artisans'),
      fetchAPI('/api/requests'),
    ]);
    artisan = artisans.find(a => String(a.id) === String(id));
    requests = allRequests.filter(r => r.artisanId === artisan?.id);
  } catch {}

  if (!artisan) return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Link href="/artisans" className="back-link">← Back to Artisans</Link>
        <p className="empty">Artisan not found</p>
      </main>
    </div>
  );

  const completed = requests.filter(r => r.status === 'completed').length;
  const earnings = requests.filter(r => r.estimatedPrice).reduce((sum, r) => sum + (r.estimatedPrice * 0.85), 0);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Link href="/artisans" className="back-link">← Back to Artisans</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="avatar-lg">{artisan.name?.[0] || 'A'}</div>
          <div>
            <h2 style={{ margin: 0 }}>{artisan.name}</h2>
            <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>{artisan.phone}</p>
          </div>
          <span className={`badge badge-${artisan.verified ? 'verified' : 'unverified'}`} style={{ marginLeft: 'auto' }}>
            {artisan.verified ? '✓ Verified' : 'Unverified'}
          </span>
        </div>

        <div className="stats">
          <div className="card"><div className="stat-value">⭐ {artisan.rating}</div><div className="stat-label">Rating</div></div>
          <div className="card"><div className="stat-value">{artisan.totalJobs}</div><div className="stat-label">Total Jobs</div></div>
          <div className="card"><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div>
          <div className="card"><div className="stat-value">₦{Math.round(earnings / 100).toLocaleString()}</div><div className="stat-label">Earnings (est.)</div></div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Details</h3>
          <table>
            <tbody>
              <tr><td style={{ fontWeight: 600, width: '140px' }}>Services</td><td>{artisan.services?.join(', ') || '—'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Available</td><td>{artisan.available ? '🟢 Online' : '🔴 Offline'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>NIN Verified</td><td>{artisan.ninVerified ? 'Yes' : 'No'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Joined</td><td>{new Date(artisan.createdAt).toLocaleDateString()}</td></tr>
            </tbody>
          </table>
        </div>

        <ArtisanDetailActions artisan={artisan} />

        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Job History ({requests.length})</h3>
          {requests.length === 0 ? <p className="empty">No jobs yet</p> : (
            <table>
              <thead><tr><th>Service</th><th>Customer</th><th>Status</th><th>Price</th><th>Date</th></tr></thead>
              <tbody>
                {requests.slice(0, 20).map(r => (
                  <tr key={r.id}>
                    <td>{r.serviceType}</td>
                    <td>{r.Customer?.name || r.Customer?.phone || '—'}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>{r.estimatedPrice ? `₦${(r.estimatedPrice / 100).toLocaleString()}` : '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
