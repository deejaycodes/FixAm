import Sidebar from '../components/Sidebar';
import { fetchAPI } from '../lib/api';

export default async function Dashboard() {
  let requests = [], artisans = [], payments = [];
  try {
    [requests, artisans, payments] = await Promise.all([
      fetchAPI('/api/requests'),
      fetchAPI('/api/artisans'),
      fetchAPI('/api/payments/verify').catch(() => []),
    ]);
  } catch {}

  const pending = requests.filter(r => r.status === 'pending').length;
  const active = requests.filter(r => ['assigned', 'accepted', 'in_progress'].includes(r.status)).length;
  const completed = requests.filter(r => r.status === 'completed').length;
  const verified = artisans.filter(a => a.verified).length;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Dashboard</h2>
        <div className="stats">
          <div className="card">
            <div className="stat-value">{pending}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="card">
            <div className="stat-value">{active}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="card">
            <div className="stat-value">{completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="card">
            <div className="stat-value">{verified} / {artisans.length}</div>
            <div className="stat-label">Verified Artisans</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Requests</h3>
          {requests.length === 0 ? (
            <p className="empty">No requests yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 10).map(r => (
                  <tr key={r.id}>
                    <td>{r.serviceType}</td>
                    <td>{r.Customer?.name || r.Customer?.phone || '—'}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
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
