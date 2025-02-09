import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isNode = mode === 'node';
  const isBrowser = mode === 'browser';

  if (isNode) {
    // Node.js build configuration
    return {
      plugins: [
        dts({
          outDir: 'dist/node',
          include: ['src'],
          exclude: ['src/tests', 'src/scripts'],
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          formats: ['es', 'cjs'],
          fileName: (format: string): string => `node/index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
          external: ['zod', /^node:/],
          output: {
            dir: 'dist',
            preserveModules: true,
            entryFileNames: 'node/[name].js',
            chunkFileNames: 'node/chunks/[name].js',
            format: 'es',
          },
        },
        target: 'node18',
        sourcemap: true,
        emptyOutDir: false,
      },
      resolve: {
        conditions: ['node', 'import', 'default'],
      },
    };
  }

  if (isBrowser) {
    // Browser build configuration
    return {
      plugins: [
        dts({
          outDir: 'dist/browser',
          include: ['src'],
          exclude: ['src/tests', 'src/scripts'],
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          formats: ['es'],
          fileName: (): string => 'browser/index.js',
        },
        rollupOptions: {
          external: ['zod'],
          output: {
            dir: 'dist',
            preserveModules: true,
            entryFileNames: 'browser/[name].js',
            chunkFileNames: 'browser/chunks/[name].js',
            format: 'es',
          },
        },
        target: 'esnext',
        sourcemap: true,
        emptyOutDir: false,
      },
      resolve: {
        conditions: ['browser', 'import', 'default'],
        alias: {
          fs: resolve(__dirname, 'src/utils/browserPolyfill.ts'),
          path: resolve(__dirname, 'src/utils/browserPolyfill.ts'),
          url: resolve(__dirname, 'src/utils/browserPolyfill.ts'),
          '../loaders/node': resolve(__dirname, 'src/loaders/browser.ts'),
        },
      },
    };
  }

  // Default configuration (should not reach here)
  throw new Error('Please specify build mode: node or browser');
});
