import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';

export default async function Referrals() {
  let referrals = [];
  try { referrals = await fetchAPI('/api/requests/referrals'); } catch {}

  const totalReferred = referrals.reduce((s, r) => s + r.referred, 0);
  const totalConversions = referrals.reduce((s, r) => s + r.conversions, 0);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>🔗 Referral Tracking</h2>
        <div className="stats">
          <div className="card">
            <div className="stat-value">{referrals.length}</div>
            <div className="stat-label">Active Referrers</div>
          </div>
          <div className="card">
            <div className="stat-value">{totalReferred}</div>
            <div className="stat-label">Total Referred</div>
          </div>
          <div className="card">
            <div className="stat-value">{totalConversions}</div>
            <div className="stat-label">Converted (completed job)</div>
          </div>
          <div className="card">
            <div className="stat-value">{totalReferred > 0 ? Math.round(totalConversions / totalReferred * 100) : 0}%</div>
            <div className="stat-label">Conversion Rate</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Top Referrers</h3>
          {referrals.length === 0 ? (
            <p className="empty">No referrals yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Referred</th>
                  <th>Converted</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.name || r.phone}</td>
                    <td><code>{r.referralCode}</code></td>
                    <td><strong>{r.referred}</strong></td>
                    <td>{r.conversions}</td>
                    <td><span className={`badge ${r.conversionRate >= 50 ? 'badge-completed' : 'badge-pending'}`}>{r.conversionRate}%</span></td>
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
