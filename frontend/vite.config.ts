
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: process.env.ENABLE_CUSTOM_DOMAIN === 'true' ? 'sellercentral.amazon.com' : 'localhost',
    // 开发环境使用自定义域名时启用HTTPS
    ...(process.env.ENABLE_CUSTOM_DOMAIN === 'true' && {
      https: fs.existsSync('./certs/key.pem') && fs.existsSync('./certs/cert.pem') ? {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
      } : false,
    })
  },
  preview: {
    port: 3000,
    host: 'sellercentral.amazon.com',
    https: fs.existsSync('./certs/key.pem') && fs.existsSync('./certs/cert.pem') ? {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem')
    } : false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
