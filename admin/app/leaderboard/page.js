import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';

export default async function Leaderboard() {
  let artisans = [];
  try { artisans = await fetchAPI('/api/requests/leaderboard'); } catch {}

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>🏆 Artisan Leaderboard</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Top artisans by completed jobs. Feature top performers to drive competition and quality.</p>

        <div className="card">
          {artisans.length === 0 ? (
            <p className="empty">No verified artisans yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Artisan</th>
                  <th>Service</th>
                  <th>Jobs</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {artisans.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '1.2rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                    <td><strong>{a.name}</strong><br /><span style={{ color: '#999', fontSize: '0.8rem' }}>{a.phone}</span></td>
                    <td>{(a.services || []).join(', ')}</td>
                    <td><strong>{a.totalJobs}</strong></td>
                    <td>⭐ {(a.rating || 0).toFixed(1)}</td>
                    <td><span className={`badge ${a.available ? 'badge-completed' : 'badge-cancelled'}`}>{a.available ? '🟢 Online' : '🔴 Offline'}</span></td>
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
