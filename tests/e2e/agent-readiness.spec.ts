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
