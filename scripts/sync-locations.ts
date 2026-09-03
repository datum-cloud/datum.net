#!/usr/bin/env tsx

/**
 * Syncs src/data/locations.json with the live Location resources from the
 * Datum Cloud control plane (locations.miloapis.com/v1alpha1, cluster-scoped).
 *
 * mapX/mapY are hand-placed pixel percentages on world-map-dots.png and are
 * NOT derivable from lat/long, so they are preserved for existing regionCodes
 * and left as null for new ones — those need manual placement before merging.
 *
 * Run: npm run sync:locations (or tsx scripts/sync-locations.ts)
 * Env: KUBECONFIG, K8S_NAMESPACE (same as newsletter action)
 */

import { loadEnv } from 'vite';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const dataPath = resolve(projectRoot, 'src/data/locations.json');

const env = loadEnv(process.env.NODE_ENV || 'development', projectRoot, '');
Object.assign(process.env, env);

// Region group by ISO country code, matching the groups already used on /locations
const COUNTRY_TO_GROUP: Record<string, string> = {
  US: 'NA',
  CA: 'NA',
  CL: 'LATAM',
  BR: 'LATAM',
  NL: 'EU',
  DE: 'EU',
  GB: 'EU',
  AE: 'MEA',
  ZA: 'MEA',
  IN: 'APAC',
  SG: 'APAC',
  AU: 'APAC',
  JP: 'APAC',
};

interface LocationEntry {
  regionCode: string;
  metro: string;
  latitude: number;
  longitude: number;
  mapX: number | null;
  mapY: number | null;
  group: string;
}

interface LocationSpec {
  coordinates?: { latitude: string; longitude: string };
  topology?: Record<string, string>;
}

async function main(): Promise<void> {
  const { K8sClient } = await import('../src/libs/k8s-client');

  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG || '.kube/config.yaml',
  });

  const response = await client.listClusterCustomResources<LocationSpec>(
    'locations.miloapis.com',
    'v1alpha1',
    'locations'
  );

  const existing: LocationEntry[] = JSON.parse(readFileSync(dataPath, 'utf-8'));
  const existingByCode = new Map(existing.map((loc) => [loc.regionCode, loc]));

  const fresh: LocationEntry[] = response.items.map((item) => {
    const regionCode = item.metadata.name;
    const topology = item.spec.topology || {};
    const countryCode = topology['topology.datum.net/country-code'] || '';
    const prior = existingByCode.get(regionCode);

    return {
      regionCode,
      metro: topology['topology.datum.net/city'] || prior?.metro || regionCode,
      latitude: Number(item.spec.coordinates?.latitude ?? prior?.latitude ?? 0),
      longitude: Number(item.spec.coordinates?.longitude ?? prior?.longitude ?? 0),
      mapX: prior?.mapX ?? null,
      mapY: prior?.mapY ?? null,
      group: COUNTRY_TO_GROUP[countryCode] || prior?.group || 'NA',
    };
  });

  const newCodes = fresh.filter((loc) => !existingByCode.has(loc.regionCode));
  const removedCodes = existing.filter(
    (loc) => !fresh.some((f) => f.regionCode === loc.regionCode)
  );

  writeFileSync(dataPath, JSON.stringify(fresh, null, 2) + '\n');

  console.table(
    fresh.map(({ regionCode, metro, group, latitude, longitude }) => ({
      regionCode,
      metro,
      group,
      latitude,
      longitude,
    }))
  );

  console.log(`[sync-locations] SUCCESS — wrote ${fresh.length} locations to ${dataPath}`);
  if (newCodes.length > 0) {
    console.warn(
      `[sync-locations] New locations need manual mapX/mapY placement: ${newCodes
        .map((l) => l.regionCode)
        .join(', ')}`
    );
  }
  if (removedCodes.length > 0) {
    console.warn(
      `[sync-locations] Removed locations no longer in the API: ${removedCodes
        .map((l) => l.regionCode)
        .join(', ')}`
    );
  }
}

main().catch((err) => {
  console.error('[sync-locations] FAILED —', err instanceof Error ? err.message : err);
  process.exit(1);
});
