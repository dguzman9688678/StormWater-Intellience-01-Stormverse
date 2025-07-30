import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, './client'),
  publicDir: path.resolve(__dirname, './client/public'),
  build: {
    outDir: path.resolve(__dirname, './dist/client'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, './client/index.html')
      }
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      port: 5173
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
});