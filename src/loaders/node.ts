import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BasicInfo,
  BasicInfoSchema,
  Codes,
  CodesSchema,
  Coordinates,
  CoordinatesSchema,
  Region,
  RegionSchema,
  References,
  ReferencesSchema,
} from '../types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

interface DataLoaders {
  basic_info: {
    schema: typeof BasicInfoSchema;
    type: BasicInfo[];
  };
  codes: {
    schema: typeof CodesSchema;
    type: Codes[];
  };
  coordinates: {
    schema: typeof CoordinatesSchema;
    type: Coordinates[];
  };
  region: {
    schema: typeof RegionSchema;
    type: Region[];
  };
  references: {
    schema: typeof ReferencesSchema;
    type: References[];
  };
}

const loaders: DataLoaders = {
  basic_info: {
    schema: BasicInfoSchema,
    type: [] as BasicInfo[],
  },
  codes: {
    schema: CodesSchema,
    type: [] as Codes[],
  },
  coordinates: {
    schema: CoordinatesSchema,
    type: [] as Coordinates[],
  },
  region: {
    schema: RegionSchema,
    type: [] as Region[],
  },
  references: {
    schema: ReferencesSchema,
    type: [] as References[],
  },
};

function loadData<K extends keyof DataLoaders>(type: K): DataLoaders[K]['type'] {
  const dataPath = join(__dirname, `../../data/${type}.json`);
  const rawData = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  return data.map((item: unknown) => loaders[type].schema.parse(item));
}

// Export type-safe functions
export const loadBasicInfo = (): BasicInfo[] => loadData('basic_info');
export const loadCodes = (): Codes[] => loadData('codes');
export const loadCoordinates = (): Coordinates[] => loadData('coordinates');
export const loadRegion = (): Region[] => loadData('region');
export const loadReferences = (): References[] => loadData('references');

export const loadBasicInfoAsync = async (): Promise<BasicInfo[]> => loadData('basic_info');
export const loadCodesAsync = async (): Promise<Codes[]> => loadData('codes');
export const loadCoordinatesAsync = async (): Promise<Coordinates[]> => loadData('coordinates');
export const loadRegionAsync = async (): Promise<Region[]> => loadData('region');
export const loadReferencesAsync = async (): Promise<References[]> => loadData('references');
