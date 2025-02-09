# OurAirports Data - JS Library

A TypeScript library for working with [OurAirports Data](https://github.com/davidmegginson/ourairports-data) data. This library provides easy access to airport information, including IATA/ICAO codes, geographical coordinates, and more.

> [!WARNING]  
> 🔧 This library is not yet ready for production use. It is still under development.
> 
> This project uses only clean data containing IATA Code airports in order to reduce the size of the package.

> [!IMPORTANT]  
> This is not an official project of OurAirports.com!

## Features

- 🌐 Universal package that works in both Node.js and browser environments
- 🔍 Search airports by IATA/ICAO codes
- 🗺️ Find airports by country or within a radius
- ✨ TypeScript support with full type definitions
- 🚀 Modern ESM package with tree-shaking support
- ⚡ Efficient data loading with sharding
- 🔒 Data validation using Zod schemas
- 📦 Automatic environment detection and optimization

## Installation

### Package Manager

```bash
npm install ourairports-data-js
# or
yarn add ourairports-data-js
# or
pnpm add ourairports-data-js
# or
bun add ourairports-data-js
```

### CDN

```html
<!-- Using unpkg -->
<script type="module">
  import OurAirports from 'https://unpkg.com/ourairports-data-js/dist/browser/index.js';
  
  const airports = new OurAirports();
  await airports.initialize();
</script>

<!-- Using jsDelivr -->
<script type="module">
  import OurAirports from 'https://cdn.jsdelivr.net/npm/ourairports-data-js/dist/browser/index.js';
  
  const airports = new OurAirports();
  await airports.initialize();
</script>
```

## Usage

### ESM Import

The library supports tree-shaking and can be imported in multiple ways:

```typescript
// Import everything
import OurAirports from 'ourairports-data-js';

// Import specific types
import { BasicInfo, AirportFilter, AirportType } from 'ourairports-data-js';

// Import schemas for validation
import { BasicInfoSchema, CodesSchema } from 'ourairports-data-js';
```

### Node.js Environment

```typescript
import OurAirports from 'ourairports-data-js';

const airports = new OurAirports();
airports.initialize(); // Synchronous initialization in Node.js

// Find airport by IATA code
const pek = airports.findByIataCode('PEK');
console.log(pek?.name); // "Beijing Capital International Airport"
console.log(pek?.type); // "large_airport"

// Find airport by ICAO code
const zbaa = airports.findByIcaoCode('ZBAA');
console.log(zbaa?.name); // "Beijing Capital International Airport"

// Find airports in China
const chineseAirports = airports.findByCountry('CN');
console.log(`Found ${chineseAirports.length} airports in China`);

// Find airports within 100km radius of Beijing Capital Airport
const nearbyAirports = airports.findAirportsInRadius(40.0799, 116.6031, 100);
console.log('Nearby airports:', nearbyAirports.map(a => ({
  name: a.name,
  type: a.type,
  distance: 'calculated by the library'
})));

// Search airports with filters
const largeAirports = airports.searchAirports({
  type: 'large_airport',
  hasIataCode: true,
  hasScheduledService: true,
  country: 'CN',
  continent: 'AS'
});
```

### Browser Environment

```typescript
import OurAirports from 'ourairports-data-js';
import { AirportFilter } from 'ourairports-data-js';

async function initAirports() {
  const airports = new OurAirports();
  
  try {
    // Asynchronous initialization in browser (automatically uses CDN)
    await airports.initializeAsync();
    
    // Search for major Chinese airports
    const filter: AirportFilter = {
      country: 'CN',
      type: 'large_airport',
      hasIataCode: true,
      hasScheduledService: true
    };
    
    const majorAirports = airports.searchAirports(filter);
    console.log('Major Chinese airports:', majorAirports);
  } catch (error) {
    console.error('Failed to initialize airports:', error);
  }
}

initAirports();
```

### Environment Detection

The library automatically detects your environment and uses the appropriate implementation:

```typescript
import OurAirports, { BasicInfo } from 'ourairports-data-js';

async function searchAirport(iataCode: string): Promise<BasicInfo | undefined> {
  const airports = new OurAirports();
  
  try {
    // Library automatically uses the appropriate initialization method
    if (typeof window !== 'undefined') {
      await airports.initializeAsync(); // Browser environment
    } else {
      airports.initialize(); // Node.js environment
    }
    
    return airports.findByIataCode(iataCode);
  } catch (error) {
    console.error('Error searching airport:', error);
    throw error;
  }
}
```

## API Reference

### Constructor

- `new OurAirports()` - Create a new instance

### Initialization Methods

- `initialize()` - Synchronous initialization (Node.js only)
- `initializeAsync()` - Asynchronous initialization (works in both Node.js and browser)

### Search Methods

- `findByIataCode(code: string): BasicInfo | undefined` - Find airport by IATA code
- `findByIcaoCode(code: string): BasicInfo | undefined` - Find airport by ICAO code
- `findByCountry(countryCode: string): BasicInfo[]` - Find airports by country code
- `findAirportsInRadius(lat: number, lon: number, radiusKm: number): BasicInfo[]` - Find airports within radius
- `searchAirports(filter: AirportFilter): BasicInfo[]` - Search airports with filters

### Types

```typescript
interface AirportFilter {
  type?: string;         // e.g., 'large_airport', 'medium_airport', 'small_airport'
  country?: string;      // ISO country code, e.g., 'US', 'CN'
  continent?: string;    // Continent code, e.g., 'NA', 'AS'
  hasIataCode?: boolean; // Whether the airport has an IATA code
  hasScheduledService?: boolean; // Whether the airport has scheduled service
}

interface BasicInfo {
  id: number;           // Unique identifier
  ident: string;        // Airport identifier (usually ICAO code)
  type: string;         // Airport type
  name: string;         // Airport name
  // ... more fields available in ./src/types.ts
}
```

## Data Updates

The library uses data from OurAirports, which is updated periodically:

- Node.js: Data is bundled with the package
- Browser: Data is automatically fetched from CDN
- Updates are delivered with each package release

## Environment-Specific Features

### Node.js
- Synchronous data loading
- File system access for data files
- Better performance with local data
- Full tree-shaking support in ESM mode

### Browser
- Asynchronous data loading
- Automatic CDN fallback
- No file system dependencies
- Optimized bundle size with tree-shaking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data provided by [OurAirports](https://ourairports.com/)
- Built with TypeScript and Zod
- Powered by jsDelivr CDN for browser environments