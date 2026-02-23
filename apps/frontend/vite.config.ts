import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@stark-dca/shared-types': path.resolve(
        __dirname,
        '../../packages/shared-types/src/index.ts',
      ),
      ws: path.resolve(__dirname, './src/lib/ws-shim.ts'),
      // Force starknet v8 for frontend (backend uses v6 at root)
      starknet: path.resolve(__dirname, './node_modules/starknet'),
    },
  },
  optimizeDeps: {
    include: ['starknetkit'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
