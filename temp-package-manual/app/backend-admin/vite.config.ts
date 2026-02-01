import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: process.env.ENABLE_CUSTOM_DOMAIN === 'true' ? 'admin.sellercentral.amazon.com' : 'localhost',
    ...(process.env.ENABLE_CUSTOM_DOMAIN === 'true' && {
      https: fs.existsSync('../certs/key.pem') && fs.existsSync('../certs/cert.pem') ? {
        key: fs.readFileSync('../certs/key.pem'),
        cert: fs.readFileSync('../certs/cert.pem')
      } : false,
    })
  },
  preview: {
    port: 3002,
    host: 'admin.sellercentral.amazon.com',
    https: fs.existsSync('../certs/key.pem') && fs.existsSync('../certs/cert.pem') ? {
      key: fs.readFileSync('../certs/key.pem'),
      cert: fs.readFileSync('../certs/cert.pem')
    } : false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false, // 禁用sourcemap避免eval问题
  },
  define: {
    // 避免eval相关问题
    global: 'globalThis',
  },
});