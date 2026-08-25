// tests/server.test.mjs
//
// Integration tests against the actual production server (server.mjs serving
// a real `dist/` build) — the code path is-agentic.com scans in production.
// Playwright's e2e suite runs against `astro dev`, which doesn't exercise
// server.mjs at all, so these behaviors (Vary headers, the agent-friendly
// markdown 404, agent Link headers) need their own coverage here instead.
//
// Requires a prior `npm run build` (not run automatically — this suite is
// about verifying server.mjs's own logic, not paying for a full site build
// on every invocation). Run with:
//   npm run build && npm run test:server

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = process.env.TEST_SERVER_PORT || '4399';
const BASE_URL = `http://localhost:${PORT}`;
const DIST_CLIENT = new URL('../dist/client', import.meta.url);

let serverProcess;

before(async () => {
  if (!existsSync(DIST_CLIENT)) {
    throw new Error('dist/client not found — run `npm run build` before `npm run test:server`.');
  }

  serverProcess = spawn(process.execPath, ['./server.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, PORT, NODE_ENV: 'production' },
    stdio: 'pipe',
  });

  // Wait for the server to accept connections (healthz is unconditional).
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/healthz`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  throw new Error('server.mjs did not become ready within 15s');
});

after(() => {
  serverProcess?.kill();
});

test('nonexistent path returns a real 404 (not a 200 app-shell)', async () => {
  const res = await fetch(`${BASE_URL}/this-path-really-does-not-exist-xyz`);
  assert.equal(res.status, 404);
});

test('nonexistent path + Accept: text/markdown returns a markdown 404 body with recovery links', async () => {
  const res = await fetch(`${BASE_URL}/this-path-really-does-not-exist-xyz`, {
    headers: { Accept: 'text/markdown' },
  });
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type') ?? '', /text\/markdown/);
  assert.match(res.headers.get('vary') ?? '', /Accept\b/);

  const body = await res.text();
  assert.match(body, /sitemap\.xml/);
  assert.match(body, /llms\.txt/);
  assert.match(body, /\/docs/);
});

test('HTML page response carries Vary: Accept (so a CDN keys on it, not just Accept-Encoding)', async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') ?? '', /text\/html/);
  assert.match(res.headers.get('vary') ?? '', /Accept\b/);
});

test('markdown-negotiated page response also carries Vary: Accept', async () => {
  const res = await fetch(`${BASE_URL}/`, { headers: { Accept: 'text/markdown' } });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') ?? '', /text\/markdown/);
  assert.match(res.headers.get('vary') ?? '', /Accept\b/);
});

test('/openapi.json is valid OpenAPI with at least one documented path', async () => {
  const res = await fetch(`${BASE_URL}/openapi.json`);
  assert.equal(res.status, 200);
  const spec = await res.json();
  assert.match(spec.openapi, /^3\./);
  assert.ok(Object.keys(spec.paths).length > 0);
});

test('/api/openapi.yaml mirrors the same spec as YAML', async () => {
  const [{ parse }, res] = await Promise.all([
    import('yaml'),
    fetch(`${BASE_URL}/api/openapi.yaml`),
  ]);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') ?? '', /yaml/);
  const spec = parse(await res.text());
  assert.match(spec.openapi, /^3\./);
  assert.ok(Object.keys(spec.paths).length > 0);
});

test('llms.txt has an explicit when-to-use section', async () => {
  const res = await fetch(`${BASE_URL}/llms.txt`);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /## When to Use Datum/);
});

test('HTML responses advertise the OpenAPI spec via a service-desc Link header', async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.match(res.headers.get('link') ?? '', /openapi\.json.*rel="service-desc"/);
});
