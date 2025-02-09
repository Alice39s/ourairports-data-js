/* eslint-disable no-console */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const DIST_DATA_DIR = join(__dirname, '../../dist/data');

function minifyJson(content: string): string {
  try {
    // Parse and stringify to remove all whitespace and formatting
    return JSON.stringify(JSON.parse(content));
  } catch (error) {
    console.error('Error minifying JSON:', error);
    throw error;
  }
}

function processFiles(): void {
  try {
    // Get all JSON files in the data directory
    const files = readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

    let totalOriginalSize = 0;
    let totalMinifiedSize = 0;

    files.forEach(file => {
      const sourcePath = join(DATA_DIR, file);
      const targetPath = join(DIST_DATA_DIR, file);

      // Read the original file
      const content = readFileSync(sourcePath, 'utf-8');
      const originalSize = Buffer.byteLength(content, 'utf-8');
      totalOriginalSize += originalSize;

      // Minify and write to dist
      const minified = minifyJson(content);
      const minifiedSize = Buffer.byteLength(minified, 'utf-8');
      totalMinifiedSize += minifiedSize;

      writeFileSync(targetPath, minified);

      console.log(`✓ ${file}:`);
      console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
      console.log(`  Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
      console.log(
        `  Saved: ${((originalSize - minifiedSize) / 1024).toFixed(2)} KB (${((1 - minifiedSize / originalSize) * 100).toFixed(1)}%)\n`
      );
    });

    console.log('Total savings:');
    console.log(`Original: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`Minified: ${(totalMinifiedSize / 1024).toFixed(2)} KB`);
    console.log(
      `Saved: ${((totalOriginalSize - totalMinifiedSize) / 1024).toFixed(2)} KB (${((1 - totalMinifiedSize / totalOriginalSize) * 100).toFixed(1)}%)`
    );
  } catch (error) {
    console.error('Error processing files:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processFiles();
}
