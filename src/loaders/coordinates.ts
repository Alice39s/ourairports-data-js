import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { Coordinates, CoordinatesSchema } from '../types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function loadCoordinates(): Coordinates[] {
  const dataPath = join(__dirname, '../data/coordinates.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  return data.map((item: unknown) => CoordinatesSchema.parse(item));
}

export type { Coordinates } from '../types'; 