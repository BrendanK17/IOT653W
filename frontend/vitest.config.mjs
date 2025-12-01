/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      // Use V8 coverage provider in CI — it's faster and avoids hanging
      // issues that can occur with the Istanbul provider in some environments.
      provider: 'v8',
    },
  },
})