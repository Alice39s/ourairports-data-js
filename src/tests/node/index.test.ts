import { describe, test, expect, beforeEach } from 'vitest';
import OurAirports from '../../index';
import { join } from 'path';
import { readFileSync } from 'fs';
import {
  BasicInfoSchema,
  CodesSchema,
  CoordinatesSchema,
  RegionSchema,
  ReferencesSchema,
  BasicInfo,
  Codes,
  Coordinates,
  Region,
  References
} from '../../types';

// Set test environment
process.env.NODE_ENV = 'test';

const DATA_DIR = join(process.cwd(), 'data');

describe('OurAirports Node.js Tests', () => {
  let airports: OurAirports;

  beforeEach(() => {
    airports = new OurAirports();
    airports.initialize();
  });

  describe('Search Functions', () => {
    test('should find airport by IATA code', () => {
      const airport = airports.findByIataCode('PEK');
      expect(airport).toBeDefined();
      expect(airport?.name).toBe('Beijing Capital International Airport');
    });

    test('should find airport by ICAO code', () => {
      const airport = airports.findByIcaoCode('ZBAA');
      expect(airport).toBeDefined();
      expect(airport?.type).toBe('large_airport');
    });

    test('should find airports by country', () => {
      const results = airports.findByCountry('CN');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBeDefined();
    });

    test('should find airports in radius', () => {
      const results = airports.findAirportsInRadius(40.0799, 116.6031, 10);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should search airports with filters', () => {
      const results = airports.searchAirports({
        type: 'large_airport',
        country: 'CN',
        continent: 'AS',
        hasIataCode: true,
        hasScheduledService: true
      });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing data gracefully', () => {
      const results = airports.searchAirports({
        country: 'XX', // Non-existent country
      });
      expect(results).toHaveLength(0);
    });

    test('should handle case-insensitive searches', () => {
      expect(airports.findByIataCode('pek')).toBeDefined();
      expect(airports.findByIcaoCode('zbaa')).toBeDefined();
      expect(airports.findByCountry('cn').length).toBeGreaterThan(0);
    });

    test('should validate coordinates', () => {
      expect(() => {
        airports.findAirportsInRadius(200, 200, -1);
      }).toThrow();
    });
  });

  describe('Data Validation', () => {
    test('should handle invalid IATA code', () => {
      const airport = airports.findByIataCode('INVALID');
      expect(airport).toBeUndefined();
    });

    test('should handle invalid ICAO code', () => {
      const airport = airports.findByIcaoCode('INVALID');
      expect(airport).toBeUndefined();
    });

    test('should handle invalid country code', () => {
      const results = airports.findByCountry('INVALID');
      expect(results).toHaveLength(0);
    });

    test('should handle empty search filters', () => {
      const results = airports.searchAirports({});
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Data type validation', () => {
    test('should validate basic_info.json schema', () => {
      const data = JSON.parse(
        readFileSync(join(DATA_DIR, 'basic_info.json'), 'utf-8')
      );
      expect(() => {
        data.forEach((item: unknown) => BasicInfoSchema.parse(item));
      }).not.toThrow();
    });

    test('should validate codes.json schema', () => {
      const data = JSON.parse(
        readFileSync(join(DATA_DIR, 'codes.json'), 'utf-8')
      );
      expect(() => {
        data.forEach((item: unknown) => CodesSchema.parse(item));
      }).not.toThrow();
    });

    test('should validate coordinates.json schema', () => {
      const data = JSON.parse(
        readFileSync(join(DATA_DIR, 'coordinates.json'), 'utf-8')
      );
      expect(() => {
        data.forEach((item: unknown) => CoordinatesSchema.parse(item));
      }).not.toThrow();
    });

    test('should validate region.json schema', () => {
      const data = JSON.parse(
        readFileSync(join(DATA_DIR, 'region.json'), 'utf-8')
      );
      expect(() => {
        data.forEach((item: unknown) => RegionSchema.parse(item));
      }).not.toThrow();
    });

    test('should validate references.json schema', () => {
      const data = JSON.parse(
        readFileSync(join(DATA_DIR, 'references.json'), 'utf-8')
      );
      expect(() => {
        data.forEach((item: unknown) => ReferencesSchema.parse(item));
      }).not.toThrow();
    });

    test('should ensure all data files have matching IDs', () => {
      const basicInfo = new Set(JSON.parse(
        readFileSync(join(DATA_DIR, 'basic_info.json'), 'utf-8')
      ).map((item: { id: number }) => item.id));

      const codes = new Set(JSON.parse(
        readFileSync(join(DATA_DIR, 'codes.json'), 'utf-8')
      ).map((item: { id: number }) => item.id));

      const coordinates = new Set(JSON.parse(
        readFileSync(join(DATA_DIR, 'coordinates.json'), 'utf-8')
      ).map((item: { id: number }) => item.id));

      const region = new Set(JSON.parse(
        readFileSync(join(DATA_DIR, 'region.json'), 'utf-8')
      ).map((item: { id: number }) => item.id));

      const references = new Set(JSON.parse(
        readFileSync(join(DATA_DIR, 'references.json'), 'utf-8')
      ).map((item: { id: number }) => item.id));

      expect(basicInfo.size).toBeGreaterThan(0);
      expect(basicInfo.size).toBe(codes.size);
      expect(basicInfo.size).toBe(coordinates.size);
      expect(basicInfo.size).toBe(region.size);
      expect(basicInfo.size).toBe(references.size);

      // Ensure all files contain the same IDs
      const allIds = Array.from(basicInfo);
      allIds.forEach(id => {
        expect(codes.has(id)).toBe(true);
        expect(coordinates.has(id)).toBe(true);
        expect(region.has(id)).toBe(true);
        expect(references.has(id)).toBe(true);
      });
    });

    test('should ensure data consistency across files', () => {
      const basicInfo = JSON.parse(
        readFileSync(join(DATA_DIR, 'basic_info.json'), 'utf-8')
      ) as BasicInfo[];

      const codes = JSON.parse(
        readFileSync(join(DATA_DIR, 'codes.json'), 'utf-8')
      ) as Codes[];

      const coordinates = JSON.parse(
        readFileSync(join(DATA_DIR, 'coordinates.json'), 'utf-8')
      ) as Coordinates[];

      const region = JSON.parse(
        readFileSync(join(DATA_DIR, 'region.json'), 'utf-8')
      ) as Region[];

      const references = JSON.parse(
        readFileSync(join(DATA_DIR, 'references.json'), 'utf-8')
      ) as References[];

      // Randomly select an ID for integrity check
      const randomId = basicInfo[0].id;
      const info = basicInfo.find(i => i.id === randomId)!;
      const code = codes.find(c => c.id === randomId)!;
      const coord = coordinates.find(c => c.id === randomId)!;
      const reg = region.find(r => r.id === randomId)!;
      const ref = references.find(r => r.id === randomId)!;

      expect(info).toBeDefined();
      expect(code).toBeDefined();
      expect(coord).toBeDefined();
      expect(reg).toBeDefined();
      expect(ref).toBeDefined();

      // Check data consistency across files
      expect(info.iata_code).toBe(code.iata_code);
    });
  });
}); 