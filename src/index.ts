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
  AirportFilter,
} from './types';
import { loadShard, loadShardAsync } from './utils/dataLoader';
import { SearchService } from './services/search';

export * from './types';

class OurAirports {
  private basicInfo: BasicInfo[] = [];
  private codes: Codes[] = [];
  private coordinates: Coordinates[] = [];
  private region: Region[] = [];
  private references: References[] = [];
  private initialized = false;
  private searchService: SearchService | null = null;
  private readonly isBrowser: boolean;

  constructor() {
    // Detect environment
    this.isBrowser = typeof window !== 'undefined' && process.env.NODE_ENV !== 'test';
  }

  /**
   * Auto-detect environment and initialize accordingly
   * This is the recommended way to initialize the library
   */
  async init(): Promise<void> {
    if (this.isBrowser) {
      await this.initializeAsync();
    } else {
      await this.initialize();
    }
  }

  /**
   * Initialize for Node.js environment
   * @throws {Error} If called in browser environment
   */
  async initialize(): Promise<void> {
    if (this.isBrowser) {
      throw new Error(
        'Synchronous initialization is not supported in browser environment. Please use initializeAsync() or init() instead.'
      );
    }

    if (this.initialized) {
      return;
    }

    try {
      [this.basicInfo, this.codes, this.coordinates, this.region, this.references] =
        await Promise.all([
          loadShard<typeof BasicInfoSchema>('basic_info.json'),
          loadShard<typeof CodesSchema>('codes.json'),
          loadShard<typeof CoordinatesSchema>('coordinates.json'),
          loadShard<typeof RegionSchema>('region.json'),
          loadShard<typeof ReferencesSchema>('references.json'),
        ]);
      this.initialized = true;
      this.initializeSearchService();
    } catch (error) {
      console.error('Failed to load airport data:', error);
      throw error;
    }
  }

  /**
   * Initialize for browser environment
   * @throws {Error} If data loading fails
   */
  async initializeAsync(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      [this.basicInfo, this.codes, this.coordinates, this.region, this.references] =
        await Promise.all([
          loadShardAsync<typeof BasicInfoSchema>('basic_info.json'),
          loadShardAsync<typeof CodesSchema>('codes.json'),
          loadShardAsync<typeof CoordinatesSchema>('coordinates.json'),
          loadShardAsync<typeof RegionSchema>('region.json'),
          loadShardAsync<typeof ReferencesSchema>('references.json'),
        ]);
      this.initialized = true;
      this.initializeSearchService();
    } catch (error) {
      console.error('Failed to load airport data:', error);
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.initialized) {
      const method = this.isBrowser ? 'initializeAsync()' : 'initialize()';
      throw new Error(
        `OurAirports is not initialized. Please call ${method} or use init() for automatic environment detection.`
      );
    }
  }

  private initializeSearchService() {
    this.searchService = new SearchService(
      this.basicInfo,
      this.codes,
      this.coordinates,
      this.region,
      this.references
    );
  }

  /**
   * Find airport by IATA code
   * @param iataCode IATA airport code (e.g., 'PEK')
   */
  findByIataCode(iataCode: string): BasicInfo | undefined {
    this.ensureInitialized();
    return this.searchService!.findByIataCode(iataCode);
  }

  /**
   * Find airport by ICAO code
   * @param icaoCode ICAO airport code (e.g., 'ZBAA')
   */
  findByIcaoCode(icaoCode: string): BasicInfo | undefined {
    this.ensureInitialized();
    return this.searchService!.findByIcaoCode(icaoCode);
  }

  /**
   * Find airports by country code
   * @param countryCode ISO country code (e.g., 'CN')
   */
  findByCountry(countryCode: string): BasicInfo[] {
    this.ensureInitialized();
    return this.searchService!.findByCountry(countryCode);
  }

  /**
   * Search airports by filter conditions
   * @param filter Search criteria
   */
  searchAirports(filter: AirportFilter): BasicInfo[] {
    this.ensureInitialized();
    return this.searchService!.searchAirports(filter);
  }

  /**
   * Get airports within a specified radius
   * @param lat Latitude in degrees
   * @param lon Longitude in degrees
   * @param radiusKm Radius in kilometers
   */
  findAirportsInRadius(lat: number, lon: number, radiusKm: number): BasicInfo[] {
    this.ensureInitialized();
    return this.searchService!.findAirportsInRadius(lat, lon, radiusKm);
  }

  /**
   * Get raw data for advanced usage
   * @returns All airport data
   */
  get data() {
    this.ensureInitialized();
    return {
      basicInfo: this.basicInfo,
      codes: this.codes,
      coordinates: this.coordinates,
      region: this.region,
      references: this.references,
    };
  }

  /**
   * Check if the instance is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if running in browser environment
   */
  get isInBrowser(): boolean {
    return this.isBrowser;
  }
}

// Export the class as both default and named export
export { OurAirports };
export default OurAirports;
