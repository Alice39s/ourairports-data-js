import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { cleanAirportName, isValidAirport } from './dataCleaners';

const CDN_BASE_URL = 'https://cdn.jsdelivr.net/npm/ourairports-js@latest/data/';

/**
 * Get data directory path for Node.js environment
 */
function getNodeDataPath(): string {
  const dataPath = join(process.cwd(), 'data');
  if (!existsSync(dataPath)) {
    throw new Error(`Data directory not found at ${dataPath}`);
  }
  return dataPath;
}

/**
 * Load and parse data shard in browser environment
 */
async function loadBrowserShard<T extends z.ZodTypeAny>(filename: string, schema: T): Promise<z.infer<T>[]> {
  const response = await fetch(`${CDN_BASE_URL}${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load data from ${CDN_BASE_URL}${filename}: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return processData(data, schema);
}

/**
 * Load and parse data shard in Node.js environment
 */
function loadNodeShard<T extends z.ZodTypeAny>(filename: string, schema: T): z.infer<T>[] {
  const dataPath = join(getNodeDataPath(), filename);
  if (!existsSync(dataPath)) {
    throw new Error(`Data file not found at ${dataPath}`);
  }

  try {
    const rawData = readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);
    return processData(data, schema);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in file ${dataPath}: ${error.message}`);
      }
      console.error(`Error loading data from ${dataPath}:`, error.message);
      console.error('Error details:', error);
    }
    throw new Error(`Failed to load data from ${dataPath}. Please ensure the data files exist in the correct location.`);
  }
}

/**
 * Process and clean data according to schema
 */
function processData<T extends z.ZodTypeAny>(data: unknown[], schema: T): z.infer<T>[] {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  const validItems: z.infer<T>[] = [];
  const errors: Error[] = [];

  data.forEach((item: unknown, index: number) => {
    try {
      const parsed = schema.parse(item);
      // If the data contains the name field, clean it
      if ('name' in parsed && typeof parsed.name === 'string') {
        const cleanedName = cleanAirportName(parsed.name);
        if (!isValidAirport(cleanedName)) {
          errors.push(new Error(`Invalid airport name at index ${index}: ${parsed.name}`));
          return;
        }
        validItems.push({ ...parsed, name: cleanedName });
      } else {
        validItems.push(parsed);
      }
    } catch (error) {
      if (error instanceof Error) {
        errors.push(new Error(`Failed to parse item at index ${index}: ${error.message}`));
      } else {
        errors.push(new Error(`Unknown error parsing item at index ${index}`));
      }
    }
  });

  if (errors.length > 0) {
    console.warn(`Found ${errors.length} errors while processing data:`);
    errors.forEach(error => console.warn(error.message));
  }

  if (validItems.length === 0) {
    throw new Error('No valid items found in data');
  }

  return validItems;
}

/**
 * Load and parse data shard
 */
export function loadShard<T extends z.ZodTypeAny>(filename: string, schema: T): z.infer<T>[] {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    throw new Error('Synchronous data loading is not supported in browser environment. Please use loadShardAsync instead.');
  }
  return loadNodeShard(filename, schema);
}

/**
 * Load and parse data shard asynchronously (supports both Node.js and browser)
 */
export async function loadShardAsync<T extends z.ZodTypeAny>(filename: string, schema: T): Promise<z.infer<T>[]> {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return loadBrowserShard(filename, schema);
  }
  return loadNodeShard(filename, schema);
} 