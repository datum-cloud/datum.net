// src/data/locationGroups.ts
export const GROUP_ORDER = ['NA', 'LATAM', 'EU', 'MEA', 'APAC'] as const;

export type LocationGroup = (typeof GROUP_ORDER)[number];

export const GROUP_META: Record<LocationGroup, { name: string; heading: string }> = {
  NA: { name: 'North America', heading: 'North America (NA)' },
  LATAM: { name: 'Latin America', heading: 'Latin America (LATAM)' },
  EU: { name: 'Europe', heading: 'Europe (EU)' },
  MEA: { name: 'Middle East & Africa', heading: 'Middle East & Africa (MEA)' },
  APAC: { name: 'Asia Pacific', heading: 'Asia Pacific (APAC)' },
};

// Country codes (topology.datum.net/country-code) covered by today's locations.
// Extend when a new country comes online; unmapped codes are dropped with a warning.
export const COUNTRY_CODE_TO_GROUP: Record<string, LocationGroup> = {
  AE: 'MEA',
  AU: 'APAC',
  BR: 'LATAM',
  CA: 'NA',
  CL: 'LATAM',
  DE: 'EU',
  GB: 'EU',
  IN: 'APAC',
  JP: 'APAC',
  NL: 'EU',
  SG: 'APAC',
  US: 'NA',
  ZA: 'MEA',
};
