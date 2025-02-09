import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { Region, RegionSchema } from '../types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function loadRegion(): Region[] {
  const dataPath = join(__dirname, '../data/region.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  return data.map((item: unknown) => RegionSchema.parse(item));
}

export type { Region } from '../types'; 