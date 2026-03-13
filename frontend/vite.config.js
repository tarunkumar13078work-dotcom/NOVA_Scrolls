import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages project-site path; keep root path in local development.
  base: mode === 'production' ? '/NOVA_Scrolls/' : '/',
  server: {
    port: 5173,
  },
}));
