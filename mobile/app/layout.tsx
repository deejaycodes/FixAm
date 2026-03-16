import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'FixAm', description: 'Find trusted artisans in Nigeria' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, themeColor: '#0D9488' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link rel="manifest" href="/manifest.json" /></head>
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
