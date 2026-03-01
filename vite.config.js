import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/fitness': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/fitness/, '/fitness'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[Proxy]', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[Proxy Response]', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[Proxy Error]', err.message);
          });
        },
      },
    },
  },
})
