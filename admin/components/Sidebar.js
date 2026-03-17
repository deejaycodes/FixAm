'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: '📊 Dashboard' },
  { href: '/requests', label: '📋 Requests' },
  { href: '/artisans', label: '👷 Artisans' },
  { href: '/payments', label: '💳 Payments' },
  { href: '/referrals', label: '🔗 Referrals' },
  { href: '/leaderboard', label: '🏆 Leaderboard' },
  { href: '/broadcast', label: '📢 Broadcast' },
  { href: '/analytics', label: '📈 Analytics' },
  { href: '/disputes', label: '⚠️ Disputes' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <nav className="sidebar">
      <h1>🛠️ FixAm</h1>
      {NAV.map(({ href, label }) => (
        <Link key={href} href={href} className={path === href ? 'active' : ''}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
