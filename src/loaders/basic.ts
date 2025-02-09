import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { BasicInfo, BasicInfoSchema } from '../types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function loadBasicInfo(): BasicInfo[] {
  const dataPath = join(__dirname, '../data/basic_info.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  return data.map((item: unknown) => BasicInfoSchema.parse(item));
}

export type { BasicInfo } from '../types'; 