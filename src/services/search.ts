import { BasicInfo, AirportFilter } from '../types';
import { calculateDistance } from '../utils/geoCalculator';

export class SearchService {
  constructor(
    private basicInfo: BasicInfo[],
    private codes: { id: number; iata_code: string | null; ident: string }[],
    private coordinates: {
      id: number;
      latitude_deg: number | null;
      longitude_deg: number | null;
    }[],
    private region: { id: number; iso_country: string; continent: string | null }[],
    private references: { id: number; scheduled_service: 'yes' | 'no' }[]
  ) {}

  findByIataCode(iataCode: string): BasicInfo | undefined {
    const code = this.codes.find(
      airport => airport.iata_code && airport.iata_code.toLowerCase() === iataCode.toLowerCase()
    );
    if (!code) return undefined;
    return this.basicInfo.find(info => info.id === code.id);
  }

  findByIcaoCode(icaoCode: string): BasicInfo | undefined {
    const code = this.codes.find(
      airport => airport.ident && airport.ident.toLowerCase() === icaoCode.toLowerCase()
    );
    if (!code) return undefined;
    return this.basicInfo.find(info => info.id === code.id);
  }

  findByCountry(countryCode: string): BasicInfo[] {
    const regionIds = this.region
      .filter(r => r.iso_country && r.iso_country.toLowerCase() === countryCode.toLowerCase())
      .map(r => r.id);
    return this.basicInfo.filter(info => regionIds.includes(info.id));
  }

  searchAirports(filter: AirportFilter): BasicInfo[] {
    if (!filter || Object.keys(filter).length === 0) {
      return this.basicInfo;
    }

    return this.basicInfo.filter(info => {
      // Filter by type
      if (filter.type && info.type !== filter.type) {
        return false;
      }

      // Filter by country or continent
      if (filter.country || filter.continent) {
        const region = this.region.find(r => r.id === info.id);
        if (!region) return false;
        if (
          filter.country &&
          (!region.iso_country || region.iso_country.toLowerCase() !== filter.country.toLowerCase())
        )
          return false;
        if (
          filter.continent &&
          (!region.continent || region.continent.toLowerCase() !== filter.continent.toLowerCase())
        )
          return false;
      }

      // Filter by IATA code presence
      if (filter.hasIataCode !== undefined) {
        const code = this.codes.find(c => c.id === info.id);
        if (!code) return false;
        const hasIata = Boolean(code.iata_code && code.iata_code.trim());
        if (hasIata !== filter.hasIataCode) return false;
      }

      // Filter by scheduled service
      if (filter.hasScheduledService !== undefined) {
        const ref = this.references.find(r => r.id === info.id);
        if (!ref) return false;
        const hasService = ref.scheduled_service === 'yes';
        if (hasService !== filter.hasScheduledService) return false;
      }

      return true;
    });
  }

  findAirportsInRadius(lat: number, lon: number, radiusKm: number): BasicInfo[] {
    // Validate input parameters
    if (lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90 degrees');
    if (lon < -180 || lon > 180) throw new Error('Longitude must be between -180 and 180 degrees');
    if (radiusKm <= 0) throw new Error('Radius must be greater than 0');

    const matchingIds = new Set(
      this.coordinates
        .filter(coord => {
          if (coord.latitude_deg === null || coord.longitude_deg === null) return false;
          const distance = calculateDistance(lat, lon, coord.latitude_deg, coord.longitude_deg);
          return distance <= radiusKm;
        })
        .map(coord => coord.id)
    );

    return this.basicInfo.filter(info => matchingIds.has(info.id));
  }
}
