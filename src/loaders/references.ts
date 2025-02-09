import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { References, ReferencesSchema } from '../types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function loadReferences(): References[] {
  const dataPath = join(__dirname, '../data/references.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  return data.map((item: unknown) => ReferencesSchema.parse(item));
}

export type { References } from '../types'; 