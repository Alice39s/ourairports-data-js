import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      ['src/tests/node/**', 'node'],
      ['src/tests/browser/**', 'happy-dom']
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.d.ts',
        'vitest.config.ts',
      ],
    },
    testTimeout: 10000,
  },
}); 