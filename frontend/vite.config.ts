import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: Object.fromEntries(
      [
        '/airports', '/cities', '/auth', '/login', '/register',
        '/example', '/llm', '/climatiq', '/terminal-transfers',
        '/transport-activity-mapping', '/tavily', '/country-regions',
      ].map(path => [path, 'http://localhost:8000'])
    ),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});
