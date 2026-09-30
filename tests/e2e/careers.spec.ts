import { test, expect } from '@playwright/test';

test.describe('Careers page', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/careers');
  });

  test('hero has the "Work with us" eyebrow above the title', async ({ page }) => {
    const hero = page.locator('#mission');
    await expect(hero.locator('.section-eyebrow')).toContainText('Work with us');
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Working at Datum');

    const eyebrow = await hero.locator('.section-eyebrow').boundingBox();
    const title = await hero.getByRole('heading', { level: 1 }).boundingBox();
    expect(eyebrow!.y).toBeLessThan(title!.y);
  });

  test('hero follows the design grid: two 572px columns, 80px apart', async ({ page }) => {
    const media = await page.locator('.career-mission-media').boundingBox();
    const copy = await page.locator('.career-mission-copy').boundingBox();
    expect(media!.width).toBeCloseTo(572, 0);
    expect(copy!.width).toBeCloseTo(572, 0);
    expect(copy!.x - (media!.x + media!.width)).toBeCloseTo(80, 0);
    // Title uses Figma's 60/70 rather than the 70px token at this width.
    const size = await page
      .locator('.career-mission-title')
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(size).toBe('60px');
  });

  test('culture section uses the new background and values card', async ({ page }) => {
    const section = page.locator('#culture-shaped');
    // #f9f9f8
    await expect(section).toHaveCSS('background-color', 'rgb(249, 249, 248)');
    await expect(section.locator('.section-eyebrow')).toContainText('About Datum');
    await expect(section.getByRole('heading', { level: 2 })).toContainText('A culture shaped by');

    const card = section.locator('.career-culture-card');
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(['Who we are', 'How we act']);
    await expect(card.getByRole('listitem')).toHaveCount(6);
    await expect(card.getByRole('link', { name: 'how we work' })).toHaveAttribute(
      'href',
      '/handbook/culture/'
    );
  });

  test('no longer shows the old stone illustrations', async ({ page }) => {
    await expect(page.locator('#culture-shaped img[alt$="illustration"]')).toHaveCount(0);
  });

  test('"Open by design" uses the new header and benefit cards', async ({ page }) => {
    const section = page.locator('#benefits');
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(section.locator('.section-eyebrow')).toContainText('Open by design');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'What to expect working here'
    );

    const card = section.locator('.career-benefits-card');
    await expect(card).toHaveCSS('border-top-color', 'rgb(12, 29, 49)');
    await expect(card.getByRole('heading', { level: 3 })).toHaveCount(6);
    // Icons take the design's "Utility 3" grey (#67717c) on a 20% blush tile.
    await expect(section.locator('.career-benefit-icon').first()).toHaveCSS(
      'color',
      'rgb(103, 113, 124)'
    );
    // Three 330px columns inside the 1224px card at this width.
    const item = await section.locator('.career-benefit').first().boundingBox();
    expect(item!.width).toBeCloseTo(330, -1);
  });

  test('roles section has the eyebrow, new background and a list or the empty state', async ({
    page,
  }) => {
    const section = page.locator('#roles');
    // #f9f9f8
    await expect(section).toHaveCSS('background-color', 'rgb(249, 249, 248)');
    await expect(section.locator('.section-eyebrow')).toContainText('Roles');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Ready to join the team?');

    // The list is a server island fed by Ashby: it shows ruled rows when there
    // are postings, otherwise the live-site empty state.
    const rows = section.locator('.career-roles-row');
    const empty = section.getByText('No open roles right now.');
    await expect(rows.first().or(empty)).toBeVisible();

    if ((await rows.count()) > 0) {
      const list = await section.locator('.career-roles-list').boundingBox();
      expect(list!.width).toBeCloseTo(800, 0);
    }
  });
});
