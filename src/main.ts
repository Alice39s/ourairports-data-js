import { OurAirports } from './index';

// Re-export everything from index
export * from './index';

// Export the class with environment detection
export default class SmartOurAirports extends OurAirports {
  constructor() {
    super();
    // Auto-initialize based on environment
    if (typeof window !== 'undefined') {
      this.initializeAsync().catch(console.error);
    } else {
      this.initialize().catch(console.error);
    }
  }
}
