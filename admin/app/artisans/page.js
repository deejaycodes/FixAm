import Sidebar from '../../components/Sidebar';
import { fetchAPI } from '../../lib/api';
import ArtisanActions from './actions';
import Link from 'next/link';

export default async function ArtisansPage() {
  let artisans = [];
  try { artisans = await fetchAPI('/api/artisans'); } catch {}

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <h2>Artisans</h2>
        <div className="card">
          {artisans.length === 0 ? (
            <p className="empty">No artisans registered yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Services</th>
                  <th>Rating</th>
                  <th>Jobs</th>
                  <th>Verified</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artisans.map(a => (
                  <tr key={a.id} className="clickable-row">
                    <td><Link href={`/artisans/${a.id}`} className="row-link">{a.name}</Link></td>
                    <td>{a.phone}</td>
                    <td>{a.services?.join(', ') || '—'}</td>
                    <td>⭐ {a.rating}</td>
                    <td>{a.totalJobs}</td>
                    <td>
                      <span className={`badge badge-${a.verified ? 'verified' : 'unverified'}`}>
                        {a.verified ? 'Yes' : 'No'}
                      </span>
                    </td>
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
