import { test, expect } from '@playwright/test';

test.describe('Roadmap item API', () => {
  test('rejects a non-numeric issue number with a problem+json 400', async ({ request }) => {
    const response = await request.get('/api/v1/roadmap/backlog-item/abc');
    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('application/problem+json');
    expect((await response.json()).status).toBe(400);
  });

  test('returns a problem+json 404 for an issue that is not on the roadmap', async ({
    request,
  }) => {
    const response = await request.get('/api/v1/roadmap/backlog-item/2147483647');
    expect(response.status()).toBe(404);
    expect((await response.json()).status).toBe(404);
  });

  test('is documented in the OpenAPI spec', async ({ request }) => {
    const spec = await (await request.get('/openapi.json')).json();
    expect(spec.paths['/api/v1/roadmap/backlog-item/{number}']?.get).toBeTruthy();
  });
});

test.describe('Roadmap page', () => {
  test('shows the new headline and the release tabs', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('What’s coming next?');
    await expect(page.getByRole('link', { name: 'Take a look', exact: true })).toHaveAttribute(
      'href',
      /github\.com\/orgs\/datum-cloud\/projects\//
    );
  });

  test('opens an item in the detail drawer and closes it with Escape', async ({ page }) => {
    await page.goto('/roadmap');

    // The backlog comes from GitHub; without credentials/cache the page shows a
    // skeleton instead of items, so there is nothing to click.
    const trigger = page.locator('button[data-roadmap-item]').first();
    test.skip((await trigger.count()) === 0, 'No roadmap items available in this environment');

    const number = await trigger.getAttribute('data-roadmap-item');
    const dialog = page.locator('roadmap-drawer dialog');

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#issue-${number}$`));
    await expect(page.locator('body')).toHaveAttribute('data-roadmap-drawer-open', '');
    // Only the drawer scrolls: the page itself (<html>) is locked while it is open.
    await expect(page.locator('html')).toHaveCSS('overflow-y', 'hidden');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('html')).not.toHaveCSS('overflow-y', 'hidden');
    await expect(page).not.toHaveURL(/#issue-/);
    await expect(trigger).toBeFocused();
  });

  test('the external-link icon goes straight to GitHub without opening the drawer', async ({
    page,
  }) => {
    await page.goto('/roadmap');

    const link = page.locator('a.roadmap-item--external').first();
    test.skip((await link.count()) === 0, 'No roadmap items available in this environment');

    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('href', /github\.com/);
    await expect(page.locator('roadmap-drawer dialog')).toBeHidden();
  });
});
