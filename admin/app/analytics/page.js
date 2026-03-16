import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';

export default async function AnalyticsPage() {
  let overview = { requests: {}, artisans: {}, revenue: {}, customers: 0 };
  let services = [];
  let areas = [];
  let revenue = [];

  try {
    [overview, services, areas, revenue] = await Promise.all([
      fetchAPI('/api/analytics/overview'),
      fetchAPI('/api/analytics/services'),
      fetchAPI('/api/analytics/areas'),
      fetchAPI('/api/analytics/revenue?days=30'),
    ]);
  } catch {}

  const r = overview.requests;
  const totalRequests = Object.values(r).reduce((a, b) => a + b, 0);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Analytics</h2>

        <div className="stats">
          <div className="card">
            <div className="stat-value">{overview.customers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="card">
            <div className="stat-value">{totalRequests}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="card">
            <div className="stat-value">₦{((overview.revenue.total || 0) / 100).toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="card">
            <div className="stat-value">₦{((overview.revenue.commission || 0) / 100).toLocaleString()}</div>
            <div className="stat-label">Commission Earned</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Revenue (Last 30 Days)</h3>
          {revenue.length === 0 ? (
            <p className="empty">No revenue data yet</p>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Revenue</th><th>Commission</th><th>Jobs</th></tr></thead>
              <tbody>
                {revenue.map(d => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>₦{(parseInt(d.revenue) / 100).toLocaleString()}</td>
                    <td>₦{(parseInt(d.commission) / 100).toLocaleString()}</td>
                    <td>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Popular Services</h3>
            {services.length === 0 ? (
              <p className="empty">No data yet</p>
            ) : (
              <table>
                <thead><tr><th>Service</th><th>Jobs</th><th>Avg Rating</th></tr></thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.serviceType}>
                      <td>{s.serviceType}</td>
                      <td>{s.count}</td>
                      <td>⭐ {parseFloat(s.avgRating || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Busiest Areas</h3>
            {areas.length === 0 ? (
              <p className="empty">No location data yet</p>
            ) : (
              <table>
                <thead><tr><th>Location</th><th>Requests</th></tr></thead>
                <tbody>
                  {areas.slice(0, 10).map((a, i) => (
                    <tr key={i}>
                      <td>{a.lat.toFixed(3)}, {a.lng.toFixed(3)}</td>
                      <td>{a.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
