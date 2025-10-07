import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5174,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  optimizeDeps: {
    include: ['tailwindcss']
  }
});


