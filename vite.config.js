import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    manifest: true,
    // Public pages ship no framework runtime — see scripts/prerender.mjs.
    // This entry is styles plus the handful of things that genuinely cannot
    // be computed at build time.
    rollupOptions: { input: 'src/client.js' },
  },
});
