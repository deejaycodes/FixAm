import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';
import RequestActions from './actions';

export default async function RequestsPage() {
  let requests = [];
  try { requests = await fetchAPI('/api/requests'); } catch {}

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Service Requests</h2>
        <div className="card">
          {requests.length === 0 ? (
            <p className="empty">No service requests yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Customer</th>
                  <th>Artisan</th>
                  <th>Status</th>
                  <th>Estimate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>{r.serviceType}</td>
                    <td>{r.description?.slice(0, 50) || '—'}</td>
                    <td>{r.Customer?.name || r.Customer?.phone || '—'}</td>
                    <td>{r.Artisan?.name || '—'}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>{r.estimatedPrice ? `₦${(r.estimatedPrice / 100).toLocaleString()}` : '—'}</td>
                    <td><RequestActions request={r} /></td>
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
