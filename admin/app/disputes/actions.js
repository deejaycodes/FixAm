'use client';
import { mutateAPI } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function DisputeActions({ request }) {
  const router = useRouter();
  const resolve = async (resolution) => {
    const note = prompt(`Resolution note for "${resolution}":`);
    if (note === null) return;
    await mutateAPI(`/api/admin/requests/${request.id}/resolve`, { method: 'PATCH', body: { resolution, note } });
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button className="btn btn-sm" onClick={() => resolve('release')} title="Release payment to artisan">💰 Release</button>
      <button className="btn btn-sm btn-danger" onClick={() => resolve('refund')} title="Refund customer">↩️ Refund</button>
      <button className="btn btn-sm btn-warning" onClick={() => resolve('redo')} title="Send new artisan">🔄 Redo</button>
    </div>
  );
}
