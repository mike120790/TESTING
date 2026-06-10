import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// On GitHub Pages the app is served from a repo subpath (e.g. /TESTING/), so the
// CI build passes VITE_BASE; local dev and other hosts stay at root ("/").
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? (process.env.VITE_BASE ?? '/') : '/',
}));
