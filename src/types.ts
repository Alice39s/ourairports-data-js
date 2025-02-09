import { z } from 'zod';

const BaseSchema = z.object({
  id: z.number(),
});

export const BasicInfoSchema = BaseSchema.extend({
  name: z.string(),
  type: z.string(),
  ident: z.string().optional(),
  iata_code: z.string().nullable(),
});

export const CodesSchema = BaseSchema.extend({
  gps_code: z.string().nullable(),
  iata_code: z.string().nullable(),
  local_code: z.string().nullable(),
  ident: z.string(),
});

export const CoordinatesSchema = BaseSchema.extend({
  latitude_deg: z.number(),
  longitude_deg: z.number(),
  elevation_ft: z.number().nullable(),
});

export const RegionSchema = BaseSchema.extend({
  continent: z.string().nullable(),
  iso_country: z.string(),
  iso_region: z.string(),
  municipality: z.string().nullable(),
});

export const ReferencesSchema = BaseSchema.extend({
  home_link: z.string().nullable(),
  wikipedia_link: z.string().nullable(),
  keywords: z.string().nullable(),
  scheduled_service: z.enum(['yes', 'no']),
}).transform(data => ({
  ...data,
  scheduled_service: data.scheduled_service ?? 'no'
}));

export type BasicInfo = z.infer<typeof BasicInfoSchema>;
export type Codes = z.infer<typeof CodesSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Region = z.infer<typeof RegionSchema>;
export type References = z.infer<typeof ReferencesSchema>;

export type AirportType = 'small_airport' | 'medium_airport' | 'large_airport' | 'heliport' | 'seaplane_base' | 'closed' | 'balloonport';

export interface AirportFilter {
  type?: AirportType;
  country?: string;
  continent?: string;
  hasIataCode?: boolean;
  hasScheduledService?: boolean;
} 