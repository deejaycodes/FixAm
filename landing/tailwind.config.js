/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0D9488',    // teal-600 — professional, trustworthy
        dark: '#134E4A',       // teal-900 — deep, premium feel
        accent: '#F59E0B',     // amber-500 — warm CTA contrast
      },
    },
  },
  plugins: [],
};
