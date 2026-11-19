// Sign in to the Datum API as a service account, the way `datumctl login --credentials`
// does (datum-cloud/datumctl internal/authutil/serviceaccount.go): sign a short-lived JWT
// with the account's RSA key and trade it at the token endpoint for a bearer token.
// No local imports, so node --test can load this file directly.
import { createSign, randomUUID } from 'node:crypto';

export interface ServiceAccountCredentials {
  client_id: string;
  private_key_id: string;
  private_key: string;
  token_uri: string;
  api_endpoint: string;
  scope?: string;
}

const REQUIRED_FIELDS = [
  'client_id',
  'private_key_id',
  'private_key',
  'token_uri',
  'api_endpoint',
] as const;

const ASSERTION_LIFETIME_SECONDS = 60;
// Get a new token this long before the old one expires, so it cannot lapse mid-request.
const EXPIRY_MARGIN_MS = 60_000;
const DEFAULT_SCOPE = 'openid profile email';

/** Parse and check the credentials JSON the Datum portal downloads. */
export function parseCredentials(raw: string): ServiceAccountCredentials {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Service account credentials are not valid JSON');
  }
  if (!data || typeof data !== 'object') {
    throw new Error('Service account credentials must be a JSON object');
  }
  const record = data as Record<string, unknown>;
  const missing = REQUIRED_FIELDS.filter(
    (field) => typeof record[field] !== 'string' || record[field] === ''
  );
  if (missing.length > 0) {
    throw new Error(`Service account credentials are missing: ${missing.join(', ')}`);
  }
  if (!String(record.token_uri).startsWith('https://')) {
    throw new Error('Service account token_uri must use https');
  }
  return data as ServiceAccountCredentials;
}

const base64url = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

/** Build the signed JWT assertion for the jwt-bearer grant. */
export function mintAssertion(creds: ServiceAccountCredentials, now: number = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const header = base64url({ alg: 'RS256', typ: 'JWT', kid: creds.private_key_id });
  const payload = base64url({
    iss: creds.client_id,
    sub: creds.client_id,
    aud: new URL(creds.token_uri).origin,
    iat,
    exp: iat + ASSERTION_LIFETIME_SECONDS,
    jti: randomUUID(),
  });
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${signer.sign(creds.private_key, 'base64url')}`;
}

interface TokenSourceOptions {
  fetchFn?: typeof fetch;
  now?: () => number;
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

/**
 * Return a function that resolves to a bearer token, reusing it until shortly before
 * it expires. A failed exchange throws and is not cached, so the next call retries.
 */
export function createTokenSource(
  creds: ServiceAccountCredentials,
  { fetchFn = fetch, now = Date.now }: TokenSourceOptions = {}
): () => Promise<string> {
  let cached: { token: string; expiresAt: number } | undefined;

  return async () => {
    if (cached && now() < cached.expiresAt - EXPIRY_MARGIN_MS) {
      return cached.token;
    }

    const response = await fetchFn(creds.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: mintAssertion(creds, now()),
        scope: creds.scope || DEFAULT_SCOPE,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as TokenResponse;
    if (!response.ok || !body.access_token) {
      const reason = body.error
        ? `${body.error} (${body.error_description ?? 'no description'})`
        : `status ${response.status}`;
      throw new Error(`Service account token exchange failed: ${reason}`);
    }

    cached = {
      token: body.access_token,
      expiresAt: now() + (body.expires_in ?? 0) * 1000,
    };
    return cached.token;
  };
}
