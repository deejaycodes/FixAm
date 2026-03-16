import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';

export default async function PaymentsPage() {
  let requests = [];
  try { requests = await fetchAPI('/api/requests'); } catch {}

  // Extract payments from completed requests that have them
  const completed = requests.filter(r => r.status === 'completed');

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Payments</h2>
        <div className="stats">
          <div className="card">
            <div className="stat-value">{completed.length}</div>
            <div className="stat-label">Completed Jobs</div>
          </div>
          <div className="card">
            <div className="stat-value">
              ₦{completed.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0) / 100}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="card">
            <div className="stat-value">
              ₦{Math.round(completed.reduce((sum, r) => sum + ((r.finalPrice || r.estimatedPrice || 0) * 0.15), 0) / 100)}
            </div>
            <div className="stat-label">Commission (15%)</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Completed Jobs</h3>
          {completed.length === 0 ? (
            <p className="empty">No completed jobs yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Artisan</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(r => {
                  const amount = (r.finalPrice || r.estimatedPrice || 0) / 100;
                  return (
                    <tr key={r.id}>
                      <td>{r.serviceType}</td>
                      <td>{r.Customer?.name || r.Customer?.phone || '—'}</td>
                      <td>{r.Artisan?.name || '—'}</td>
                      <td>₦{amount.toLocaleString()}</td>
                      <td>₦{Math.round(amount * 0.15).toLocaleString()}</td>
                      <td>{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
