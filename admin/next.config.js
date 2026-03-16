/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ];
  },
};
