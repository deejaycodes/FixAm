'use client';

import { useRouter } from 'next/navigation';
import { mutateAPI } from '../../../lib/api';

export default function ArtisanDetailActions({ artisan }) {
  const router = useRouter();

  async function toggleVerify() {
    await mutateAPI(`/api/artisans/${artisan.id}`, { method: 'PATCH', body: { verified: !artisan.verified } });
    router.refresh();
  }

  async function toggleAvailable() {
    await mutateAPI(`/api/artisans/${artisan.id}`, { method: 'PATCH', body: { available: !artisan.available } });
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      <button className={`btn ${artisan.verified ? 'btn-danger' : 'btn-success'}`} onClick={toggleVerify}>
        {artisan.verified ? 'Unverify Artisan' : 'Verify Artisan'}
      </button>
      <button className="btn btn-primary" onClick={toggleAvailable}>
        {artisan.available ? 'Set Offline' : 'Set Online'}
      </button>
    </div>
  );
}
