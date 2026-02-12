import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Change 3001 to 3002 (or whatever port your backend is actually using)
      '/api': { target: 'http://127.0.0.1:3005', changeOrigin: true },
    },
  },
});
