import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const projectBridge = resolve(__dirname, '../../../project-bridge');

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html') },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor';
          if (id.includes('project-bridge/engine') || id.includes('project-bridge\\engine')) return 'engine';
          if (id.includes('project-bridge/ui') || id.includes('project-bridge\\ui')) return 'ui';
          if (id.includes('project-bridge/shared') || id.includes('project-bridge\\shared')) return 'shared';
        },
      },
      external: [/targets\/server/, /targets\/backend-server/, '@prisma\/adapter-pg', 'better-sqlite3', 'pg', 'playwright'],
    },
  },
  resolve: {
    alias: [
      { find: '@meanwhile-together/ui/styles', replacement: resolve(projectBridge, 'ui/src/styles') },
      { find: '@meanwhile-together/shared', replacement: resolve(projectBridge, 'shared/src') },
      { find: '@meanwhile-together/engine', replacement: resolve(projectBridge, 'engine/index.ts') },
      { find: '@meanwhile-together/ui', replacement: resolve(projectBridge, 'ui/src/index.ts') },
    ],
  },
  optimizeDeps: {
    exclude: ['@meanwhile-together/shared', '@meanwhile-together/engine', '@meanwhile-together/ui'],
  },
  server: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
    // When accessed via backend server proxy (port 3002), HMR must use proxy so WebSocket connects to 3002
    hmr: process.env.VITE_HMR_PROXY_PORT
      ? { host: 'localhost', port: Number(process.env.VITE_HMR_PROXY_PORT), clientPort: Number(process.env.VITE_HMR_PROXY_PORT), protocol: 'ws' as const }
      : { host: 'localhost', port: 5174, clientPort: 5174 },
  },
  base: '/',
});
