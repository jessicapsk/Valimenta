import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '../node_modules/.vite/backend',
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.spec.ts'],
  },
});
