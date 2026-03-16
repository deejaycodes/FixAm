import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';

export default async function DisputesPage() {
  let disputes = [];
  try { disputes = await fetchAPI('/api/analytics/disputes'); } catch {}

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Disputes & Issues</h2>
        <div className="card">
          {disputes.length === 0 ? (
            <p className="empty">No disputes reported 🎉</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Artisan</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id}>
                    <td>{d.serviceType}</td>
                    <td>{d.Customer?.name || d.Customer?.phone || '—'}</td>
                    <td>{d.Artisan?.name || '—'}</td>
                    <td>{d.review}</td>
                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                    <td>{new Date(d.updatedAt).toLocaleDateString()}</td>
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
