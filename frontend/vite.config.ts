import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  cacheDir: '../node_modules/.vite/frontend',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.spec.tsx', 'src/**/*.spec.ts'],
  },
});
