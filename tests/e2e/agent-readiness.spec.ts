import { test, expect } from '@playwright/test';

// Coverage for the is-agentic.com readiness fixes. Vary-header and
// production-only 404 behavior (server.mjs, not exercised by `astro dev`)
// are covered separately in tests/server.test.mjs against a real build.

test.describe('Heading structure (Content without JavaScript)', () => {
  test('homepage has exactly one h1, and nothing heading-level appears before it', async ({
    page,
  }) => {
    await page.goto('/');

    // Excludes the dev-only Astro Dev Toolbar overlay (its own panels use
    // h1s like "Audit" / "Settings") — not real page content, and absent
    // from the production build is-agentic actually scans.
    const headingTags = await page.evaluate(() =>
      [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
        .filter((el) => !el.closest('astro-dev-toolbar'))
        .map((el) => el.tagName.toLowerCase())
    );

    expect(headingTags[0]).toBe('h1');
    expect(headingTags.filter((tag) => tag === 'h1')).toHaveLength(1);
  });

  test('nav dropdown column labels are not heading elements', async ({ page }) => {
    await page.goto('/');

    // These are decorative mega-menu labels, not part of the content
    // outline — asserting the tag directly (not just visual position)
    // guards against a future h3 creeping back in.
    const tagNames = await page
      .locator('.nav-dropdown-title, .mobile-dropdown-title')
      .evaluateAll((els) => els.map((el) => el.tagName.toLowerCase()));

    expect(tagNames.length).toBeGreaterThan(0);
    for (const tag of tagNames) {
      expect(tag).not.toMatch(/^h[1-6]$/);
    }
  });

  test('the "What is Datum?" section has a real (if visually hidden) heading', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('#what-is-datum h2');
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText('What is Datum?');
  });

  test('the Datum Platform pillars are real headings, not styled paragraphs', async ({ page }) => {
    await page.goto('/');

    // These were <p class="font-semibold"> — visually a heading, semantically
    // flat. Asserting the tag (not just visible text) guards against that
    // regressing back to a paragraph.
    const headings = page.locator('#datum-platform h3');
    await expect(headings).toHaveText([
      'Private, protected, performant.',
      'Deliver',
      'Build',
      'Connect',
      'Essentials',
    ]);
  });
});

test.describe('Agent-friendly 404 (HTML)', () => {
  test('404 page returns 404 status and links to recovery resources', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-e2e');
    expect(response?.status()).toBe(404);

    const recoveryLinks = page.locator('.page-404-recovery-links');
    await expect(recoveryLinks.locator('a[href="/sitemap.xml"]')).toBeVisible();
    await expect(recoveryLinks.locator('a[href="/llms.txt"]')).toBeVisible();
    await expect(recoveryLinks.locator('a[href="/docs"]')).toBeVisible();
  });
});

test.describe('OpenAPI spec published', () => {
  test('/openapi.json is a valid OpenAPI 3.x document with paths', async ({ request }) => {
    const response = await request.get('/openapi.json');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');

    const spec = await response.json();
    expect(spec.openapi).toMatch(/^3\./);
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
  });

  test('/api/openapi.yaml mirrors the JSON spec', async ({ request }) => {
    const response = await request.get('/api/openapi.yaml');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('yaml');

    const body = await response.text();
    expect(body).toContain('openapi: 3.');
    expect(body).toContain('paths:');
  });
});

test.describe('Agent instruction / when-to-use', () => {
  test('llms.txt has an explicit when-to-use section', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();
    expect(body).toContain('## When to Use Datum');
    expect(body).toContain('How an agent should call Datum');
  });
});

test.describe('REST typed error model', () => {
  test('OpenAPI spec documents a typed RFC 9457 Problem schema on 4xx/5xx responses', async ({
    request,
  }) => {
    const response = await request.get('/openapi.json');
    const spec = await response.json();

    const problemSchema = spec.components?.schemas?.Problem;
    expect(problemSchema).toBeTruthy();
    expect(problemSchema.required).toEqual(expect.arrayContaining(['type', 'title', 'status']));

    for (const path of ['/api/v1/roadmap/backlog-meta', '/api/roadmap/backlog-meta']) {
      const backlogResponses = spec.paths[path].get.responses;
      expect(backlogResponses['429']).toBeTruthy();
      expect(backlogResponses['500']).toBeTruthy();
      for (const status of ['429', '500']) {
        const content = backlogResponses[status].content['application/problem+json'];
        expect(content.schema.$ref).toBe('#/components/schemas/Problem');
      }
    }
  });

  test('a rate-limited response body is a well-formed RFC 9457 problem object', async ({
    request,
  }) => {
    // Exhaust the endpoint's window (limit 20 / 10s — see src/libs/rateLimit.ts)
    // with margin for a stray request from another test sharing the dev server.
    // The canonical and deprecated-alias paths share one budget (same resource).
    let last;
    for (let i = 0; i < 25; i++) {
      last = await request.get('/api/v1/roadmap/backlog-meta');
      if (last.status() === 429) break;
    }

    expect(last?.status()).toBe(429);
    expect(last?.headers()['content-type']).toContain('application/problem+json');
    expect(last?.headers()['retry-after']).toMatch(/^\d+$/);

    const body = await last?.json();
    expect(body.status).toBe(429);
    expect(typeof body.title).toBe('string');
  });
});

test.describe('REST versioning / deprecation policy', () => {
  test('OpenAPI declares a major-version URL path and lifecycle extension', async ({ request }) => {
    const response = await request.get('/openapi.json');
    const spec = await response.json();

    expect(spec['x-api-lifecycle']?.current_major_version).toBe('v1');
    expect(spec.paths['/api/v1/roadmap/backlog-meta']).toBeTruthy();
    expect(spec.paths['/api/roadmap/backlog-meta'].get.deprecated).toBe(true);
    expect(spec.info.description).toContain('/api/v1');
    expect(spec.info.description).toContain('Deprecation');
    expect(spec.info.description).toContain('Sunset');
  });

  test('the canonical versioned path serves the resource with an API-Version header', async ({
    request,
  }) => {
    const response = await request.get('/api/v1/roadmap/backlog-meta');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['api-version']).toBe('1');

    const body = await response.json();
    expect(typeof body.isRefreshing).toBe('boolean');
  });

  test('the deprecated alias serves the same resource but signals deprecation on the wire', async ({
    request,
  }) => {
    const response = await request.get('/api/roadmap/backlog-meta');
    expect(response.ok()).toBeTruthy();

    const headers = response.headers();
    expect(headers['deprecation']).toMatch(/^@\d+$/);
    expect(headers['link']).toContain('/api/v1/roadmap/backlog-meta');
    expect(headers['link']).toContain('rel="successor-version"');

    const body = await response.json();
    expect(typeof body.isRefreshing).toBe('boolean');
  });
});

test.describe('Rate limit response headers', () => {
  test('/api/v1/roadmap/backlog-meta returns standard RateLimit-* headers', async ({ request }) => {
    const response = await request.get('/api/v1/roadmap/backlog-meta');
    const headers = response.headers();

    expect(headers['ratelimit-limit']).toMatch(/^\d+$/);
    expect(headers['ratelimit-remaining']).toMatch(/^\d+$/);
    expect(headers['ratelimit-reset']).toMatch(/^\d+$/);
  });
});

test.describe('MCP server manifest', () => {
  test('server.json, the well-known server card, and its clean alias agree, and none claims an unreachable remote', async ({
    request,
  }) => {
    const [serverJsonRes, wellKnownRes, aliasRes] = await Promise.all([
      request.get('/server.json'),
      request.get('/.well-known/mcp/server-card.json'),
      request.get('/mcp/server-card'),
    ]);

    expect(wellKnownRes.headers()['content-type']).toContain('application/mcp-server-card+json');
    expect(aliasRes.headers()['content-type']).toContain('application/mcp-server-card+json');

    const [serverJson, wellKnown, alias] = await Promise.all([
      serverJsonRes.json(),
      wellKnownRes.json(),
      aliasRes.json(),
    ]);

    expect(wellKnown).toEqual(alias);
    expect(serverJson.name).toBe(wellKnown.name);
    expect(serverJson.version).toBe(wellKnown.version);

    // Regression guard: an earlier version of this manifest advertised a
    // `remotes` entry at a hostname that doesn't resolve at all. Until a real
    // hosted Streamable HTTP transport ships, this manifest must not claim one.
    for (const manifest of [serverJson, wellKnown]) {
      expect(manifest.remotes).toBeUndefined();
      expect(JSON.stringify(manifest)).not.toContain('mcp.datum.net');
      expect(manifest.packages?.[0]?.transport?.type).toBe('stdio');
    }
  });

  test('.well-known/ai-catalog.json points at the MCP server card', async ({ request }) => {
    const response = await request.get('/.well-known/ai-catalog.json');
    expect(response.headers()['content-type']).toContain('application/ai-catalog+json');

    const catalog = await response.json();
    expect(catalog.entries[0].url).toBe('https://www.datum.net/mcp/server-card');
    expect(catalog.entries[0].type).toBe('application/mcp-server-card+json');
  });
});

test.describe('Organization schema completeness', () => {
  test('homepage Organization JSON-LD includes address and a contactPoint email', async ({
    page,
  }) => {
    await page.goto('/');

    const orgSchema = await page.evaluate(() => {
      const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data];
          const org = graph.find((n: { '@type'?: string }) => n['@type'] === 'Organization');
          if (org) return org;
        } catch {
          // not JSON, skip
        }
      }
      return null;
    });

    expect(orgSchema).toBeTruthy();
    expect(orgSchema.address).toMatchObject({
      '@type': 'PostalAddress',
      addressCountry: 'US',
    });
    expect(orgSchema.address.streetAddress).toBeTruthy();
    expect(orgSchema.address.postalCode).toBeTruthy();
    expect(orgSchema.contactPoint.email).toBe('support@datum.net');
  });
});

test.describe('Developer resources page', () => {
  test('/developers exists, is titled with the product name, and links every named resource category', async ({
    page,
  }) => {
    const response = await page.goto('/developers');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/Datum/);
    await expect(page.locator('h1')).toHaveText('Datum Developer Resources');

    for (const label of [
      'OpenAPI spec',
      'Auth docs',
      'MCP server',
      'CLI (datumctl)',
      'Rate limits',
      'Changelog',
      'Status',
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }

    // Regression guard: neither exists as real, distinct published content
    // today (confirmed against datum.net/docs) — a card that leads to
    // nothing is worse for discoverability than not having the card. See
    // the header comment in src/pages/developers.astro.
    await expect(page.getByText('API docs', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Developer portal', { exact: true })).toHaveCount(0);
  });

  test('/developers is listed in llms.txt and sitemap.xml', async ({ request }) => {
    const [llmsRes, sitemapRes] = await Promise.all([
      request.get('/llms.txt'),
      request.get('/sitemap.xml'),
    ]);

    expect(await llmsRes.text()).toContain('https://www.datum.net/developers');
    expect(await sitemapRes.text()).toContain('<loc>https://www.datum.net/developers</loc>');
  });
});

test.describe('Developer resource discoverability', () => {
  test('.well-known/api-catalog points at real, resolving service-desc URLs', async ({
    request,
  }) => {
    const response = await request.get('/.well-known/api-catalog');
    const catalog = await response.json();

    const hrefs = catalog.linkset.flatMap((entry: Record<string, { href: string }[]>) =>
      Object.values(entry)
        .flat()
        .map((link) => (typeof link === 'string' ? link : link.href))
        .filter(Boolean)
    );

    // The old service-desc for api.datum.net pointed at a retired page that
    // silently redirects to the generic docs home — assert it's gone.
    expect(hrefs).not.toContain('https://www.datum.net/docs/api/reference/');

    const siteEntry = catalog.linkset.find(
      (e: { anchor: string }) => e.anchor === 'https://www.datum.net'
    );
    expect(siteEntry['service-desc'][0].href).toBe('https://www.datum.net/openapi.json');

    const serviceDocHrefs = siteEntry['service-doc'].map((l: { href: string }) => l.href);
    expect(serviceDocHrefs).toContain('https://www.datum.net/developers');
  });

  test('the datum-docs agent skill has no known-dead links and a matching digest', async ({
    request,
  }) => {
    const skillResponse = await request.get('/.well-known/agent-skills/datum-docs/SKILL.md');
    const body = await skillResponse.text();

    expect(body).not.toContain('/docs/api/reference');
    expect(body).not.toContain('/docs/quickstart/');

    const indexResponse = await request.get('/.well-known/agent-skills/index.json');
    const index = await indexResponse.json();
    const entry = index.skills.find((s: { name: string }) => s.name === 'datum-docs-search');

    const crypto = await import('node:crypto');
    const actualDigest = `sha256:${crypto.createHash('sha256').update(body).digest('hex')}`;
    expect(entry.digest).toBe(actualDigest);
  });
});
