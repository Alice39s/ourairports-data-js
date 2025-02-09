import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isNode = mode === 'node';
  const isBrowser = mode === 'browser';
  const isMain = mode === 'main';

  if (isMain) {
    // Main entry point configuration
    return {
      plugins: [
        dts({
          outDir: 'dist',
          include: ['src'],
          exclude: ['src/tests', 'src/scripts'],
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/main.ts'),
          formats: ['es'],
          fileName: () => 'index.js',
        },
        rollupOptions: {
          external: ['zod', /^node:/],
          output: {
            dir: 'dist',
            preserveModules: false,
            format: 'es',
            exports: 'named',
            interop: 'auto',
          },
        },
        target: 'esnext',
        sourcemap: true,
        emptyOutDir: false,
      },
      resolve: {
        conditions: ['import', 'default'],
      },
    };
  }

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
          entry: resolve(__dirname, 'src/node.ts'),
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
            exports: 'named',
            interop: 'auto',
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
          entry: resolve(__dirname, 'src/browser.ts'),
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
            exports: 'named',
            interop: 'auto',
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
  throw new Error('Please specify build mode: node, browser, or main');
});
