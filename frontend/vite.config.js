import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Resolve GitHub Pages project-site path from repository name.
  base:
    mode === 'production'
      ? `/${(process.env.GITHUB_REPOSITORY || 'tarunkumar13078work-dotcom/Nova').split('/')[1] || 'Nova'}/`
      : '/',
  server: {
    port: 5173,
  },
}));
