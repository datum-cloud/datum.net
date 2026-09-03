// src/types/locations.ts
import type { LocationGroup } from '@data/locationGroups';

export interface LocationEntry {
  regionCode: string;
  metro: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  region: string;
  group: LocationGroup;
  mapX?: number;
  mapY?: number;
}
