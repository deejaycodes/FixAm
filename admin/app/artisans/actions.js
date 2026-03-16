'use client';

import { useRouter } from 'next/navigation';
import { mutateAPI } from '../../lib/api';

export default function ArtisanActions({ artisan }) {
  const router = useRouter();

  async function toggleVerify() {
    await mutateAPI(`/api/artisans/${artisan.id}`, {
      method: 'PATCH',
      body: { verified: !artisan.verified },
    });
    router.refresh();
  }

  async function toggleAvailable() {
    await mutateAPI(`/api/artisans/${artisan.id}`, {
      method: 'PATCH',
      body: { available: !artisan.available },
    });
    router.refresh();
  }

  return (
    <span style={{ display: 'flex', gap: '0.5rem' }}>
      <button className={`btn btn-sm ${artisan.verified ? 'btn-danger' : 'btn-success'}`} onClick={toggleVerify}>
        {artisan.verified ? 'Unverify' : 'Verify'}
      </button>
      <button className="btn btn-sm btn-primary" onClick={toggleAvailable}>
        {artisan.available ? 'Disable' : 'Enable'}
      </button>
    </span>
  );
}
