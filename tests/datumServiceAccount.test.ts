// The newsletter form runs on Datum Compute, where there is no kubeconfig. It signs in to
// the Datum API as a service account instead: it signs a JWT with the account's key and
// trades it at auth.datum.net for a bearer token. These tests pin down the parts that
// auth.datum.net checks and the token reuse that keeps every signup from minting a token.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import {
  parseCredentials,
  mintAssertion,
  createTokenSource,
} from '../src/libs/datumServiceAccount.ts';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const PEM = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();

const CREDS = {
  type: 'datum_service_account',
  client_email: 'newsletter@example',
  client_id: '1234567890',
  private_key_id: 'key-1',
  private_key: PEM,
  token_uri: 'https://auth.datum.net/oauth/v2/token',
  api_endpoint: 'https://api.datum.net',
  scope: 'openid profile email',
};

const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString());

test('parseCredentials reads the file the portal downloads', () => {
  const creds = parseCredentials(JSON.stringify(CREDS));
  assert.equal(creds.client_id, '1234567890');
  assert.equal(creds.api_endpoint, 'https://api.datum.net');
});

test('parseCredentials names the missing field instead of failing at signup time', () => {
  const withoutKey = { ...CREDS, private_key: undefined };
  assert.throws(() => parseCredentials(JSON.stringify(withoutKey)), /private_key/);
  assert.throws(() => parseCredentials('not json'), /not valid JSON/);
});

// The key in the staging and production Secrets was downloaded without token_uri and
// api_endpoint, so the form failed before it ever reached auth.datum.net.
test('parseCredentials fills token_uri and api_endpoint for an older credentials file', () => {
  const older = { ...CREDS, token_uri: undefined, api_endpoint: undefined };
  const creds = parseCredentials(JSON.stringify(older), { apiEndpoint: 'https://api.example' });
  assert.equal(creds.token_uri, 'https://auth.datum.net/oauth/v2/token');
  assert.equal(creds.api_endpoint, 'https://api.example');
});

test('values in the credentials file win over the defaults', () => {
  const creds = parseCredentials(JSON.stringify(CREDS), { apiEndpoint: 'https://api.example' });
  assert.equal(creds.api_endpoint, 'https://api.datum.net');
});

test('without api_endpoint in the file or a default, parseCredentials says which is missing', () => {
  const older = { ...CREDS, api_endpoint: undefined };
  assert.throws(() => parseCredentials(JSON.stringify(older)), /api_endpoint/);
});

test('parseCredentials refuses a token_uri that would send the signed JWT in clear text', () => {
  const plain = { ...CREDS, token_uri: 'http://auth.datum.net/oauth/v2/token' };
  assert.throws(() => parseCredentials(JSON.stringify(plain)), /https/);
});

test('mintAssertion builds the JWT auth.datum.net accepts (same claims as datumctl)', () => {
  const now = Date.parse('2026-11-19T10:00:00Z');
  const jwt = mintAssertion(parseCredentials(JSON.stringify(CREDS)), now);
  const [header, payload, signature] = jwt.split('.');

  // auth.datum.net finds the public key by kid; a wrong kid means "invalid assertion".
  assert.deepEqual(decode(header), { alg: 'RS256', typ: 'JWT', kid: 'key-1' });

  const claims = decode(payload);
  assert.equal(claims.iss, '1234567890');
  assert.equal(claims.sub, '1234567890');
  // The audience is the issuer origin, not the token endpoint path.
  assert.equal(claims.aud, 'https://auth.datum.net');
  assert.equal(claims.iat, now / 1000);
  assert.equal(claims.exp - claims.iat, 60);
  assert.ok(claims.jti, 'each assertion needs a unique id so it cannot be replayed');

  const verify = createVerify('RSA-SHA256');
  verify.update(`${header}.${payload}`);
  assert.ok(verify.verify(publicKey, Buffer.from(signature, 'base64url')));
});

function fakeTokenEndpoint(responses: Array<{ status: number; body: unknown }>) {
  const calls: URLSearchParams[] = [];
  const fetchFn = async (_url: string | URL | Request, init?: RequestInit) => {
    calls.push(new URLSearchParams(String(init?.body)));
    const next = responses.shift();
    if (!next) throw new Error('unexpected token request');
    return new Response(JSON.stringify(next.body), { status: next.status });
  };
  return { calls, fetchFn: fetchFn as typeof fetch };
}

test('the token source reuses a token until it is about to expire', async () => {
  const { calls, fetchFn } = fakeTokenEndpoint([
    { status: 200, body: { access_token: 'first', expires_in: 3600 } },
    { status: 200, body: { access_token: 'second', expires_in: 3600 } },
  ]);
  let now = Date.parse('2026-11-19T10:00:00Z');
  const getToken = createTokenSource(parseCredentials(JSON.stringify(CREDS)), {
    fetchFn,
    now: () => now,
  });

  assert.equal(await getToken(), 'first');
  assert.equal(calls[0].get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  assert.equal(calls[0].get('scope'), 'openid profile email');

  now += 30 * 60 * 1000;
  assert.equal(await getToken(), 'first', 'a signup inside the hour must not mint a new token');
  assert.equal(calls.length, 1);

  // Inside the last minute the token could expire mid-request, so get a new one.
  now += 29.5 * 60 * 1000;
  assert.equal(await getToken(), 'second');
  assert.equal(calls.length, 2);
});

test('a rejected exchange reports what auth.datum.net said, and is not cached', async () => {
  const { calls, fetchFn } = fakeTokenEndpoint([
    { status: 400, body: { error: 'invalid_grant', error_description: 'key not found' } },
    { status: 200, body: { access_token: 'ok', expires_in: 3600 } },
  ]);
  const getToken = createTokenSource(parseCredentials(JSON.stringify(CREDS)), { fetchFn });

  await assert.rejects(getToken(), /invalid_grant \(key not found\)/);
  assert.equal(await getToken(), 'ok');
  assert.equal(calls.length, 2);
});
