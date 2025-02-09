import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { Codes, CodesSchema } from '../types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function loadCodes(): Codes[] {
  const dataPath = join(__dirname, '../data/codes.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  return data.map((item: unknown) => CodesSchema.parse(item));
}

export type { Codes } from '../types'; 