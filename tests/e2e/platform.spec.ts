import { test, expect } from '@playwright/test';

test.describe('Platform page', () => {
  test('is served at /platform instead of redirecting', async ({ page }) => {
    const response = await page.goto('/platform');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toMatch(/^\/platform\/?$/);
  });

  test('renders every section', async ({ page }) => {
    await page.goto('/platform');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('60 seconds.');
    await expect(page.locator('.backbone-svg .backbone-card')).toHaveCount(6);
    await expect(page.locator('.platform-resource-list')).toHaveCount(2);
    await expect(page.getByRole('link', { name: /View docs/ })).toHaveAttribute(
      'href',
      'https://www.datum.net/docs'
    );
    await expect(page.locator('#features .essentials-item')).toHaveCount(11);
    await expect(page.locator('#features .essentials-grid--pine')).toBeAttached();
    await expect(page.getByRole('heading', { level: 2, name: /Take control of/ })).toBeVisible();
  });

  test('shows the backbone in its final state with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/platform');

    await expect(page.locator('.backbone-card-body').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('.backbone-packets')).toBeHidden();
  });

  test('has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/platform');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('serves the markdown export', async ({ request }) => {
    const response = await request.get('/platform.md');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/markdown');
  });
});
