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
  await airports.init();
</script>

<!-- Using jsDelivr -->
<script type="module">
  import OurAirports from 'https://cdn.jsdelivr.net/npm/ourairports-data-js/dist/browser/index.js';

  const airports = new OurAirports();
  await airports.init();
</script>
```

## Usage

### Basic Usage

The library automatically detects your environment (Node.js or browser) and uses the appropriate implementation:

```typescript
import OurAirports from 'ourairports-data-js';

async function main() {
  // Create instance
  const airports = new OurAirports();

  // Initialize (auto-detects environment)
  await airports.init();

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
  console.log(
    'Nearby airports:',
    nearbyAirports.map(a => a.name)
  );

  // Search airports with filters
  const largeAirports = airports.searchAirports({
    type: 'large_airport',
    hasIataCode: true,
    hasScheduledService: true,
    country: 'CN',
    continent: 'AS',
  });
}

main().catch(console.error);
```

### Advanced Usage

#### Environment-Specific Imports

You can explicitly import the environment-specific version if needed:

```typescript
// Browser-specific import
import OurAirports from 'ourairports-data-js/browser';

// Node.js-specific import
import OurAirports from 'ourairports-data-js/node';
```

#### Type Imports

```typescript
// Import types
import type {
  BasicInfo, // Airport basic information
  AirportFilter, // Search filter interface
  AirportType, // Airport type enum
  Coordinates, // Airport coordinates
  Region, // Airport region information
} from 'ourairports-data-js';

// Import validation schemas
import { BasicInfoSchema, CoordinatesSchema, RegionSchema } from 'ourairports-data-js';
```

### Search Examples

#### Find by IATA/ICAO Code

```typescript
// Find by IATA code
const pek = airports.findByIataCode('PEK');
console.log(pek?.name); // "Beijing Capital International Airport"

// Find by ICAO code
const zbaa = airports.findByIcaoCode('ZBAA');
console.log(zbaa?.name); // "Beijing Capital International Airport"
```

#### Search with Filters

```typescript
// Search for major airports in China
const majorAirports = airports.searchAirports({
  type: 'large_airport',
  country: 'CN',
  hasIataCode: true,
  hasScheduledService: true,
  continent: 'AS',
});

// Find airports within radius
const nearbyAirports = airports.findAirportsInRadius(
  40.0799, // latitude
  116.6031, // longitude
  100 // radius in kilometers
);
```

### Advanced Features

#### Raw Data Access

```typescript
// Get access to raw data for advanced usage
const { basicInfo, codes, coordinates, region, references } = airports.data;
```

#### Environment Detection

```typescript
// Check current environment
if (airports.isInBrowser) {
  console.log('Running in browser');
} else {
  console.log('Running in Node.js');
}
```

## API Reference

### Constructor

- `new OurAirports()` - Create a new instance

### Initialization Methods

- `init()` - Auto-detect environment and initialize (recommended)
- `initialize()` - Explicit Node.js initialization
- `initializeAsync()` - Explicit browser initialization

### Search Methods

- `findByIataCode(code: string): BasicInfo | undefined` - Find airport by IATA code
- `findByIcaoCode(code: string): BasicInfo | undefined` - Find airport by ICAO code
- `findByCountry(countryCode: string): BasicInfo[]` - Find airports by country code
- `findAirportsInRadius(lat: number, lon: number, radiusKm: number): BasicInfo[]` - Find airports within radius
- `searchAirports(filter: AirportFilter): BasicInfo[]` - Search airports with filters

### Properties

- `isInitialized: boolean` - Check if the instance is initialized
- `isInBrowser: boolean` - Check if running in browser environment
- `data: AirportData` - Get raw data for advanced usage

### Types

```typescript
interface AirportFilter {
  type?: string; // e.g., 'large_airport', 'medium_airport', 'small_airport'
  country?: string; // ISO country code, e.g., 'US', 'CN'
  continent?: string; // Continent code, e.g., 'NA', 'AS'
  hasIataCode?: boolean; // Whether the airport has an IATA code
  hasScheduledService?: boolean; // Whether the airport has scheduled service
}

interface BasicInfo {
  id: number; // Unique identifier
  ident: string; // Airport identifier (usually ICAO code)
  type: string; // Airport type
  name: string; // Airport name
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

- Synchronous data loading available
- File system access for data files
- Better performance with local data
- CommonJS and ESM support

### Browser

- Automatic CDN data loading
- No file system dependencies
- Optimized bundle size
- Modern ESM format

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data provided by [OurAirports](https://ourairports.com/)
- Built with TypeScript and Zod
- Powered by jsDelivr CDN for browser environments
