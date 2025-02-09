import { z } from 'zod';

const isBrowser = typeof window !== 'undefined' && process.env.NODE_ENV !== 'test';

/**
 * Load and parse data shard
 */
export async function loadShard<T extends z.ZodTypeAny>(filename: string): Promise<z.infer<T>[]> {
  // Check if we're in a browser environment
  if (isBrowser) {
    throw new Error(
      'Synchronous data loading is not supported in browser environment. Please use loadShardAsync instead.'
    );
  }

  // In Node.js environment, dynamically import node loaders
  const nodeLoaders = await import('../loaders/node');

  // Map filename to loader function
  const loaderMap = {
    'basic_info.json': nodeLoaders.loadBasicInfo,
    'codes.json': nodeLoaders.loadCodes,
    'coordinates.json': nodeLoaders.loadCoordinates,
    'region.json': nodeLoaders.loadRegion,
    'references.json': nodeLoaders.loadReferences,
  } as const;

  const loader = loaderMap[filename as keyof typeof loaderMap];
  if (!loader) {
    throw new Error(`No loader found for file: ${filename}`);
  }

  return loader() as unknown as z.infer<T>[];
}

/**
 * Load and parse data shard asynchronously (supports both Node.js and browser)
 */
export async function loadShardAsync<T extends z.ZodTypeAny>(
  filename: string
): Promise<z.infer<T>[]> {
  // Dynamically import the appropriate loaders based on environment
  const loaders = isBrowser ? await import('../loaders/browser') : await import('../loaders/node');

  // Map filename to async loader function
  const loaderMap = {
    'basic_info.json': loaders.loadBasicInfoAsync,
    'codes.json': loaders.loadCodesAsync,
    'coordinates.json': loaders.loadCoordinatesAsync,
    'region.json': loaders.loadRegionAsync,
    'references.json': loaders.loadReferencesAsync,
  } as const;

  const loader = loaderMap[filename as keyof typeof loaderMap];
  if (!loader) {
    throw new Error(`No loader found for file: ${filename}`);
  }

  return loader() as unknown as Promise<z.infer<T>[]>;
}
