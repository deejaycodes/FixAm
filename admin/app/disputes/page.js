import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';
import DisputeActions from './actions';

export default async function DisputesPage() {
  let requests = [];
  try { requests = await fetchAPI('/api/admin/requests'); } catch {}

  const lowRated = requests.filter(r => r.rating && r.rating <= 2);
  const cancelled = requests.filter(r => r.status === 'cancelled').slice(0, 10);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Disputes & Issues</h2>

        <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '1rem' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>⚠️ Low Ratings (≤2 stars) — {lowRated.length}</h3>
          {lowRated.length === 0 ? (
            <p className="empty">No low-rated jobs 🎉</p>
          ) : (
            <table>
              <thead><tr><th>Service</th><th>Customer</th><th>Artisan</th><th>Rating</th><th>Review</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {lowRated.map(r => (
                  <tr key={r.id}>
                    <td>{r.serviceType}</td>
                    <td>{r.Customer?.name || r.Customer?.phone || '—'}</td>
                    <td>{r.Artisan?.name || '—'}</td>
                    <td>{'⭐'.repeat(r.rating)}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.review || '—'}</td>
                    <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
                    <td><DisputeActions request={r} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>❌ Recent Cancellations — {cancelled.length}</h3>
          {cancelled.length === 0 ? (
            <p className="empty">No cancellations</p>
          ) : (
            <table>
              <thead><tr><th>Service</th><th>Customer</th><th>Artisan</th><th>Description</th><th>Date</th></tr></thead>
              <tbody>
                {cancelled.map(r => (
                  <tr key={r.id}>
                    <td>{r.serviceType}</td>
                    <td>{r.Customer?.name || r.Customer?.phone || '—'}</td>
                    <td>{r.Artisan?.name || 'None matched'}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description || '—'}</td>
                    <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
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
