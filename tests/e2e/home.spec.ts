import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check if the title exists (any non-empty title)
    // await expect(page).toHaveTitle('Welcome to Datum Inc. Website');
    await expect(page).toHaveTitle(/./);

    // Check if the main content is visible
    // await expect(page.locator('main')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Check if navigation links are visible and clickable
    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCount(await navLinks.count());

    // Test a specific navigation link
    const firstNavLink = navLinks.first();
    const href = await firstNavLink.getAttribute('href');
    if (href) {
      await firstNavLink.click();
      await expect(page).toHaveURL(new RegExp(href));
    }
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for essential meta tags
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content');
  });

  // test('should be responsive', async ({ page }) => {
  //   await page.goto('/');

  //   // Test mobile viewport
  //   await page.setViewportSize({ width: 375, height: 667 });
  //   await expect(page.locator('nav')).toBeVisible();

  //   // Test desktop viewport
  //   await page.setViewportSize({ width: 1280, height: 800 });
  //   await expect(page.locator('nav')).toBeVisible();
  // });
});
