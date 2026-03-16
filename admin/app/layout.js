import './globals.css';

export const metadata = {
  title: 'FixAm Admin',
  description: 'Admin dashboard for FixAm artisan platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
