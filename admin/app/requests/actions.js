'use client';

import { useRouter } from 'next/navigation';
import { mutateAPI } from '../../lib/api';

export default function RequestActions({ request }) {
  const router = useRouter();

  async function complete() {
    if (!confirm('Mark this job as completed?')) return;
    await mutateAPI(`/api/requests/${request.id}/complete`, { method: 'PATCH' });
    router.refresh();
  }

  if (request.status === 'completed' || request.status === 'cancelled') return null;

  return (
    <button className="btn btn-success btn-sm" onClick={complete}>
      Complete
    </button>
  );
}
