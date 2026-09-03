import crypto from 'node:crypto';
import { Cache } from '@libs/cache';
import staticLocations from '@data/locations.json';
import { COUNTRY_CODE_TO_GROUP } from '@data/locationGroups';
import type { LocationEntry } from '@/src/types/locations';

const cache = new Cache('.cache');

// Secrets are read from process.env only (never import.meta.env): Vite can
// statically inline import.meta.env.X at build time if the referencing module
// ever ends up in a client-side bundle, which would bake this private key
// into a public bundle. This lib is server-only, so process.env is the only
// safe source here.
const API_URL = process.env.API_URL || 'https://api.datum.net';
const AUTH_HOSTNAME = process.env.DATUM_SA_AUTH_HOSTNAME || 'auth.datum.net';
const CLIENT_ID = process.env.DATUM_SA_CLIENT_ID || '';
const PRIVATE_KEY_ID = process.env.DATUM_SA_PRIVATE_KEY_ID || '';
const PRIVATE_KEY = process.env.DATUM_SA_PRIVATE_KEY || '';
const SCOPE = process.env.DATUM_SA_SCOPE || '';
const PROJECT_ID = process.env.DATUM_PROJECT_ID || '';

const TOKEN_ENDPOINT = `https://${AUTH_HOSTNAME}/oauth/v2/token`;
const TOKEN_CACHE_KEY = 'locationsApiToken';
const LOCATIONS_CACHE_KEY = 'locationsMerged';
const TOKEN_SAFETY_BUFFER_MS = 60_000;
// Locations change rarely; a long TTL is fine since the cache can be forced to
// regenerate on demand via DELETE /api/cache ({"names": ["locationsMerged"]}).
const LOCATIONS_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawLocation = any;

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Signs an RS256 JWT-bearer assertion with raw node:crypto. The service
 * account's private key is PKCS#1 ("BEGIN RSA PRIVATE KEY"); crypto.createSign
 * handles that PEM directly, so no library (jose, jsonwebtoken) is needed.
 */
function mintAssertion(): string {
  const header = { alg: 'RS256', typ: 'JWT', kid: PRIVATE_KEY_ID };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: CLIENT_ID,
    sub: CLIENT_ID,
    aud: `https://${AUTH_HOSTNAME}`,
    iat: now,
    exp: now + 60,
    jti: crypto.randomUUID(),
  };

  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(PRIVATE_KEY);

  return `${signingInput}.${b64url(signature)}`;
}

async function getAccessToken(): Promise<string> {
  if (await cache.has(TOKEN_CACHE_KEY)) {
    const token = await cache.get<string>(TOKEN_CACHE_KEY);
    if (token) return token;
  }

  const assertion = mintAssertion();
  const form = new URLSearchParams();
  form.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  form.set('assertion', assertion);
  form.set('scope', SCOPE);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Token exchange response missing access_token');
  }

  const expiresInMs = (data.expires_in ?? 0) * 1000;
  await cache.set(
    TOKEN_CACHE_KEY,
    data.access_token,
    Math.max(expiresInMs - TOKEN_SAFETY_BUFFER_MS, 0)
  );

  return data.access_token as string;
}

async function fetchRawLocations(accessToken: string): Promise<RawLocation[]> {
  const url = `${API_URL}/apis/resourcemanager.miloapis.com/v1alpha1/projects/${PROJECT_ID}/control-plane/apis/locations.miloapis.com/v1alpha1/locations`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Locations API request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.items ?? [];
}

function isReady(item: RawLocation): boolean {
  const conditions = item?.status?.conditions;
  if (!Array.isArray(conditions)) return false;
  return conditions.some((c: RawLocation) => c?.type === 'Ready' && c?.status === 'True');
}

function toLocationEntry(
  item: RawLocation,
  staticByCode: Map<string, { mapX: number; mapY: number }>
): LocationEntry | null {
  const regionCode = item?.metadata?.name;
  const topology = item?.spec?.topology ?? {};
  const metro = topology['topology.datum.net/city'];
  const countryCode = topology['topology.datum.net/country-code'];
  const region = topology['topology.datum.net/region'];
  const latitude = parseFloat(item?.spec?.coordinates?.latitude);
  const longitude = parseFloat(item?.spec?.coordinates?.longitude);

  if (!regionCode || !metro || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    console.warn('[locations] Skipping malformed location item:', regionCode ?? item);
    return null;
  }

  const group = COUNTRY_CODE_TO_GROUP[countryCode];
  if (!group) {
    console.warn(`[locations] Skipping ${regionCode}: unmapped country code "${countryCode}"`);
    return null;
  }

  const staticEntry = staticByCode.get(regionCode);

  return {
    regionCode,
    metro,
    latitude,
    longitude,
    countryCode,
    region,
    group,
    ...(staticEntry ? { mapX: staticEntry.mapX, mapY: staticEntry.mapY } : {}),
  };
}

/**
 * Live location catalog from the Datum Cloud API, merged with hand-placed
 * mapX/mapY pin coordinates from the static locations.json registry.
 * Falls back to locations.json untouched on any failure (missing env vars,
 * auth/network error, malformed response) so the page never breaks.
 */
export async function getLocations(): Promise<LocationEntry[]> {
  if (await cache.has(LOCATIONS_CACHE_KEY)) {
    const cached = await cache.get<LocationEntry[]>(LOCATIONS_CACHE_KEY);
    if (cached) return cached;
  }

  try {
    if (!CLIENT_ID || !PRIVATE_KEY_ID || !PRIVATE_KEY || !SCOPE || !PROJECT_ID) {
      throw new Error('Missing required DATUM_SA_*/DATUM_PROJECT_ID env vars');
    }

    const staticByCode = new Map(
      (staticLocations as Array<{ regionCode: string; mapX: number; mapY: number }>).map((loc) => [
        loc.regionCode,
        { mapX: loc.mapX, mapY: loc.mapY },
      ])
    );

    const token = await getAccessToken();
    const raw = await fetchRawLocations(token);
    const entries = raw
      .filter(isReady)
      .map((item) => toLocationEntry(item, staticByCode))
      .filter((entry): entry is LocationEntry => entry !== null);

    if (entries.length === 0) {
      throw new Error('Locations API returned zero usable entries');
    }

    await cache.set(LOCATIONS_CACHE_KEY, entries, LOCATIONS_CACHE_TTL_MS);
    return entries;
  } catch (err) {
    console.warn(
      '[locations] Falling back to static locations.json:',
      err instanceof Error ? err.message : err
    );
    return staticLocations as LocationEntry[];
  }
}
