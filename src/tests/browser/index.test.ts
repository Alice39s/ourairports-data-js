/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import OurAirports from '../../index';

// Mock window to simulate browser environment
const windowSpy = vi.spyOn(global, 'window', 'get');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
windowSpy.mockImplementation(() => ({}) as Window & typeof globalThis);

describe('OurAirports Browser Tests', () => {
  let airports: OurAirports;
  const mockData = {
    basic_info: [
      {
        id: 1,
        name: 'Beijing Capital International Airport',
        type: 'large_airport',
        ident: 'ZBAA',
        iata_code: 'PEK',
      },
    ],
    codes: [{ id: 1, ident: 'ZBAA', iata_code: 'PEK' }],
    coordinates: [{ id: 1, latitude_deg: 40.0799, longitude_deg: 116.6031 }],
    region: [{ id: 1, iso_country: 'CN', iso_region: 'CN-BJ', continent: 'AS' }],
    references: [{ id: 1, scheduled_service: 'yes' }],
  };

  beforeEach(() => {
    // Reset mocks and instances before each test
    vi.clearAllMocks();
    airports = new OurAirports();

    // Mock fetch for data loading
    global.fetch = vi.fn().mockImplementation((url: string) => {
      const fileName = url.split('/').pop();
      const key = fileName?.replace('.json', '') as keyof typeof mockData;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData[key]),
      });
    });
  });

  describe('Environment Detection', () => {
    test('should detect browser environment', () => {
      expect(typeof window).not.toBe('undefined');
    });

    test('should use async initialization in browser', async () => {
      await expect(airports.initializeAsync()).resolves.not.toThrow();
      expect(global.fetch).toHaveBeenCalled();
    });

    test('should throw error for sync initialization in browser', () => {
      expect(() => airports.initialize()).toThrow(/not supported in browser/);
    });
  });

  describe('Data Loading', () => {
    test('should load all data files', async () => {
      await airports.initializeAsync();
      expect(global.fetch).toHaveBeenCalledTimes(5); // 5 data files

      // Verify each file was loaded
      const files = [
        'basic_info.json',
        'codes.json',
        'coordinates.json',
        'region.json',
        'references.json',
      ];
      files.forEach(file => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(file));
      });
    });

    test('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      await expect(airports.initializeAsync()).rejects.toThrow('Failed to load airport data');
    });

    test('should handle invalid data', async () => {
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ invalid: 'data' }]),
        })
      );
      await expect(airports.initializeAsync()).rejects.toThrow();
    });

    test('should handle HTTP errors', async () => {
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
      );
      await expect(airports.initializeAsync()).rejects.toThrow();
    });
  });

  describe('Search Functions', () => {
    beforeEach(async () => {
      await airports.initializeAsync();
    });

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
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
    });

    test('should find airports in radius', () => {
      const results = airports.findAirportsInRadius(40.0799, 116.6031, 10);
      expect(results).toHaveLength(1);
      expect(results[0].ident).toBe('ZBAA');
    });

    test('should search airports with filters', () => {
      const results = airports.searchAirports({
        type: 'large_airport',
        country: 'CN',
        continent: 'AS',
        hasIataCode: true,
        hasScheduledService: true,
      });
      expect(results).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await airports.initializeAsync();
    });

    test('should handle missing data gracefully', () => {
      const results = airports.searchAirports({
        country: 'XX', // Non-existent country
      });
      expect(results).toHaveLength(0);
    });

    test('should handle case-insensitive searches', () => {
      expect(airports.findByIataCode('pek')).toBeDefined();
      expect(airports.findByIcaoCode('zbaa')).toBeDefined();
      expect(airports.findByCountry('cn')).toHaveLength(1);
    });

    test('should validate coordinates', () => {
      expect(() => {
        airports.findAirportsInRadius(200, 200, -1);
      }).toThrow();
    });
  });
});
