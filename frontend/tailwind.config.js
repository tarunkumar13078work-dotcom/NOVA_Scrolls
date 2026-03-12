/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"Sora"', '"DM Sans"', 'sans-serif'],
      },
      colors: {
        space: '#050816',
        neon: '#7c3aed',
        aqua: '#00eaff',
        glow: '#ff00cc',
      },
      boxShadow: {
        neon: '0 10px 40px rgba(124, 58, 237, 0.45)',
        aqua: '0 10px 40px rgba(0, 234, 255, 0.35)',
        card: '0 20px 80px rgba(5, 8, 22, 0.65)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        glow: 'conic-gradient(from 120deg at 50% 50%, rgba(124,58,237,0.35), rgba(0,234,255,0.25), rgba(255,0,204,0.2), rgba(124,58,237,0.35))',
      },
    },
  },
  plugins: [],
};
