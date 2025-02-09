import { defineConfig } from 'tsup';
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function copyDataFiles() {
  const dataFiles = [
    'basic_info.json',
    'codes.json',
    'coordinates.json',
    'region.json',
    'references.json'
  ];

  try {
    // Copy to node dist
    await mkdir(join('dist', 'node', 'data'), { recursive: true });
    for (const file of dataFiles) {
      await copyFile(
        join('data', file),
        join('dist', 'node', 'data', file)
      );
    }

    // Copy to browser dist
    await mkdir(join('dist', 'browser', 'data'), { recursive: true });
    for (const file of dataFiles) {
      await copyFile(
        join('data', file),
        join('dist', 'browser', 'data', file)
      );
    }
  } catch (error) {
    console.error('Error copying data files:', error);
    process.exit(1);
  }
}

export default defineConfig([
  // Node.js build
  {
    entry: ['src/index.ts'],
    outDir: 'dist/node',
    format: ['esm'],
    dts: true,
    clean: true,
    splitting: true,
    treeshake: true,
    platform: 'node',
    target: 'node16',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  },
  // Browser build
  {
    entry: ['src/index.ts'],
    outDir: 'dist/browser',
    format: ['esm'],
    dts: true,
    clean: false,
    splitting: true,
    treeshake: true,
    platform: 'browser',
    target: 'es2020',
    external: ['fs', 'path', 'url'],
    define: {
      'process.env.NODE_ENV': '"production"',
      'process.versions': '{}',
      'process.platform': '"browser"'
    },
    async onSuccess() {
      await copyDataFiles();
    }
  }
]); 