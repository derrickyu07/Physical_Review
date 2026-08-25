import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js'; // reuse your existing Vite config/aliases

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.js'],
      css: true, // needed so CSS Modules imports don't blow up component tests
    },
  })
);