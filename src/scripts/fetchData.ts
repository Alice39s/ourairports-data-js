/* eslint no-console: "off" */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { cleanAirportName, isValidAirport } from '../utils/dataCleaners';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const AIRPORTS_CSV_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
const DATA_DIR = join(__dirname, '../../data');

interface RawAirportRecord {
  id: string;
  ident: string;
  type: string;
  name: string;
  latitude_deg: string;
  longitude_deg: string;
  elevation_ft: string;
  continent: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: string;
  gps_code: string;
  iata_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
}

interface ProcessedAirport {
  id: number;
  ident: string;
  type: string;
  name: string;
  latitude_deg: number | null;
  longitude_deg: number | null;
  elevation_ft: number | null;
  continent: string | null;
  iso_country: string;
  iso_region: string;
  municipality: string | null;
  scheduled_service: 'yes' | 'no';
  gps_code: string | null;
  iata_code: string | null;
  local_code: string | null;
  home_link: string | null;
  wikipedia_link: string | null;
  keywords: string | null;
}

function parseNumber(value: string): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

function createDataShard(airports: ProcessedAirport[], fields: Array<keyof ProcessedAirport>, filename: string): void {
  const shard = airports.map(airport => {
    const shardData: Partial<ProcessedAirport> = { id: airport.id };
    fields.forEach(field => {
      // @ts-expect-error Ignore type error for now
      shardData[field] = airport[field];
    });
    return shardData;
  });
  
  writeFileSync(
    join(DATA_DIR, filename),
    JSON.stringify(shard, null, 2)
  );
}

export async function fetchAirportsData(): Promise<void> {
  try {
    console.log('Starting to download airport data...');
    const response = await fetch(AIRPORTS_CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvData = await response.text();
    console.log('Data download completed, starting to parse...');
    
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      cast: false
    }) as RawAirportRecord[];

    const processedRecords = records
      .map((record) => {
        const cleanedName = cleanAirportName(record.name);
        if (!isValidAirport(cleanedName)) {
          return null;
        }
        return {
          id: parseNumber(record.id)!,
          ident: record.ident,
          type: record.type,
          name: cleanedName,
          latitude_deg: parseNumber(record.latitude_deg),
          longitude_deg: parseNumber(record.longitude_deg),
          elevation_ft: parseNumber(record.elevation_ft),
          continent: record.continent || null,
          iso_country: record.iso_country,
          iso_region: record.iso_region,
          municipality: record.municipality || null,
          scheduled_service: record.scheduled_service || 'no',
          gps_code: record.gps_code || null,
          iata_code: record.iata_code || null,
          local_code: record.local_code || null,
          home_link: record.home_link || null,
          wikipedia_link: record.wikipedia_link || null,
          keywords: record.keywords || null,
        };
      })
      .filter((record): record is ProcessedAirport => record !== null);

    // Ensure the data directory exists
    mkdirSync(DATA_DIR, { recursive: true });

    // Create data shards
    createDataShard(processedRecords as ProcessedAirport[], [
      'home_link',
      'wikipedia_link',
      'keywords',
      'scheduled_service'
    ], 'references.json');

    createDataShard(processedRecords as ProcessedAirport[], [
      'gps_code',
      'iata_code',
      'local_code',
      'ident'
    ], 'codes.json');

    createDataShard(processedRecords as ProcessedAirport[], [
      'latitude_deg',
      'longitude_deg',
      'elevation_ft'
    ], 'coordinates.json');

    createDataShard(processedRecords as ProcessedAirport[], [
      'continent',
      'iso_country',
      'iso_region',
      'municipality'
    ], 'region.json');

    createDataShard(processedRecords as ProcessedAirport[], [
      'name',
      'type',
      'iata_code'
    ], 'basic_info.json');

    console.log('Data processing completed!');
    console.log(`Processed ${processedRecords.length} airport records`);
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

// If the script is run directly, execute data retrieval
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchAirportsData();
} 