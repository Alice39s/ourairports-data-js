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

const CDN_BASE_URL = 'https://cdn.jsdelivr.net/npm/ourairports-data-js@latest/data/';

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

async function loadDataAsync<K extends keyof DataLoaders>(
  type: K
): Promise<DataLoaders[K]['type']> {
  const response = await fetch(`${CDN_BASE_URL}${type}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load ${type} data: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.map((item: unknown) => loaders[type].schema.parse(item));
}

// Export type-safe functions
export const loadBasicInfo = async (): Promise<BasicInfo[]> => loadDataAsync('basic_info');
export const loadCodes = async (): Promise<Codes[]> => loadDataAsync('codes');
export const loadCoordinates = async (): Promise<Coordinates[]> => loadDataAsync('coordinates');
export const loadRegion = async (): Promise<Region[]> => loadDataAsync('region');
export const loadReferences = async (): Promise<References[]> => loadDataAsync('references');

export const loadBasicInfoAsync = loadBasicInfo;
export const loadCodesAsync = loadCodes;
export const loadCoordinatesAsync = loadCoordinates;
export const loadRegionAsync = loadRegion;
export const loadReferencesAsync = loadReferences;
