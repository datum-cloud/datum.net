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

    const backlogResponses = spec.paths['/api/roadmap/backlog-meta'].get.responses;
    expect(backlogResponses['429']).toBeTruthy();
    expect(backlogResponses['500']).toBeTruthy();
    for (const status of ['429', '500']) {
      const content = backlogResponses[status].content['application/problem+json'];
      expect(content.schema.$ref).toBe('#/components/schemas/Problem');
    }
  });

  test('a rate-limited response body is a well-formed RFC 9457 problem object', async ({
    request,
  }) => {
    // Exhaust the endpoint's window (limit 20 / 10s — see src/libs/rateLimit.ts)
    // with margin for a stray request from another test sharing the dev server.
    let last;
    for (let i = 0; i < 25; i++) {
      last = await request.get('/api/roadmap/backlog-meta');
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
  test('OpenAPI info documents the versioning policy', async ({ request }) => {
    const response = await request.get('/openapi.json');
    const spec = await response.json();

    expect(spec.info.description).toContain('API-Version');
    expect(spec.info.description).toContain('Deprecation');
    expect(spec.info.description).toContain('Sunset');
  });

  test('responses carry an API-Version header', async ({ request }) => {
    const response = await request.get('/api/roadmap/backlog-meta');
    expect(response.headers()['api-version']).toBe('1');
  });
});

test.describe('Rate limit response headers', () => {
  test('/api/roadmap/backlog-meta returns standard RateLimit-* headers', async ({ request }) => {
    const response = await request.get('/api/roadmap/backlog-meta');
    const headers = response.headers();

    expect(headers['ratelimit-limit']).toMatch(/^\d+$/);
    expect(headers['ratelimit-remaining']).toMatch(/^\d+$/);
    expect(headers['ratelimit-reset']).toMatch(/^\d+$/);
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
