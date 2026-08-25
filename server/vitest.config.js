import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 15000, // mongodb-memory-server can be slow to spin up on first run
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['scripts/**', 'tests/**', '**/*.config.js'],
    },
  },
});
