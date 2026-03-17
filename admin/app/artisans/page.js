import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';
import Link from 'next/link';
import ArtisanActions from './actions';

export default async function ArtisansPage() {
  let artisans = [];
  try { artisans = await fetchAPI('/api/artisans'); } catch {}

  const pending = artisans.filter(a => !a.verified);
  const verified = artisans.filter(a => a.verified);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Artisans</h2>

        {pending.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: '1rem' }}>
            <h3 style={{ color: '#f59e0b', marginBottom: '0.75rem' }}>⏳ Pending Approval ({pending.length})</h3>
            <table>
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Services</th><th>Bank</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pending.map(a => (
                  <tr key={a.id}>
                    <td><Link href={`/artisans/${a.id}`} className="row-link">{a.name}</Link></td>
                    <td>{a.phone}</td>
                    <td>{a.services?.join(', ') || '—'}</td>
                    <td>{a.paystackSubaccount ? '✅' : '❌'}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><ArtisanActions artisan={a} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>✅ Verified Artisans ({verified.length})</h3>
          {verified.length === 0 ? (
            <p className="empty">No verified artisans yet</p>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Services</th><th>Rating</th><th>Jobs</th><th>Available</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {verified.map(a => (
                  <tr key={a.id} className="clickable-row">
                    <td><Link href={`/artisans/${a.id}`} className="row-link">{a.name}</Link></td>
                    <td>{a.phone}</td>
                    <td>{a.services?.join(', ') || '—'}</td>
                    <td>⭐ {a.rating}</td>
                    <td>{a.totalJobs}</td>
                    <td>{a.available ? '🟢' : '🔴'}</td>
                    <td><ArtisanActions artisan={a} /></td>
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
