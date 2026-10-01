import { test, expect } from '@playwright/test';

test.describe('About page', () => {
  test('renders every section', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('kind of cloud');
    await expect(page.locator('.about-companies-item')).toHaveCount(6);
    await expect(page.locator('[data-collage]')).toBeAttached();
    await expect(page.locator('.about-investors-cell')).toHaveCount(7);
    await expect(page.locator('[data-explore-card]')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Explore team' })).toHaveAttribute(
      'href',
      '/about/team'
    );
    await expect(page.getByRole('link', { name: 'Go wild' })).toHaveAttribute(
      'href',
      '/about/in-the-wild'
    );
  });

  test('explore tab bar is sticky and its active tab follows the card in view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/about');

    const bar = page.locator('[data-explore-tabs]');
    const tab = (id: string) => page.locator(`[data-explore-tab="${id}"]`);
    const background = (id: string) =>
      tab(id).evaluate((el) => getComputedStyle(el).backgroundColor);
    // Scrolls so the card's top edge sits `top` px below the viewport's top.
    const scrollCardTo = (id: string, top: number) =>
      page.evaluate(
        ([cardId, offset]) => {
          const card = document.getElementById(`explore-${cardId}`);
          if (card) window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - offset);
        },
        [id, top] as const
      );

    await expect(tab('team')).toHaveClass(/is-active/);

    // The next card is only halfway up the screen: its tab must not take over yet.
    await scrollCardTo('work', 500);
    await expect(tab('team')).toHaveClass(/is-active/);
    await expect(tab('work')).not.toHaveClass(/is-active/);

    // Once it reaches the sticky bar it does.
    await scrollCardTo('work', 150);
    await expect(tab('work')).toHaveClass(/is-active/);
    await expect(tab('team')).not.toHaveClass(/is-active/);
    // Pine Forge (#4d6356)
    await expect.poll(() => background('work')).toBe('rgb(77, 99, 86)');
    // Still pinned near the top of the viewport while the cards scroll under it.
    expect((await bar.boundingBox())?.y).toBeCloseTo(16, 0);

    await scrollCardTo('wild', 500);
    await expect(tab('work')).toHaveClass(/is-active/);
    await expect(tab('wild')).not.toHaveClass(/is-active/);

    await scrollCardTo('wild', 150);
    await expect(tab('wild')).toHaveClass(/is-active/);
    // Canyon Clay Links (#9c7979)
    await expect.poll(() => background('wild')).toBe('rgb(156, 121, 121)');
    expect((await bar.boundingBox())?.y).toBeCloseTo(16, 0);
  });

  test('clicking a tab scrolls to its card', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/about');

    await page.locator('[data-explore-tab="wild"]').click();
    await expect(page.locator('[data-explore-tab="wild"]')).toHaveClass(/is-active/);
    await expect
      .poll(async () => (await page.locator('#explore-wild').boundingBox())?.y ?? 9999)
      .toBeLessThan(400);
  });

  test('a clicked tab stays active while the page scrolls past other cards', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/about');

    // Record every tab that is ever active from the click until the scroll settles.
    await page.evaluate(() => {
      const seen = new Set<string>();
      (window as unknown as { __seen: Set<string> }).__seen = seen;
      const record = () =>
        document
          .querySelectorAll('[data-explore-tab].is-active')
          .forEach((el) => seen.add(el.getAttribute('data-explore-tab') ?? ''));
      new MutationObserver(record).observe(document.querySelector('[data-explore-tabs]')!, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class'],
      });
    });

    await page.locator('[data-explore-tab="wild"]').click();
    await expect(page.locator('#explore-wild')).toBeInViewport();
    await page.waitForTimeout(1200);

    const seen = await page.evaluate(() =>
      [...(window as unknown as { __seen: Set<string> }).__seen].filter((id) => id !== 'team')
    );
    // "team" was active before the click; "work" must never light up on the way.
    expect(seen).toEqual(['wild']);
  });

  test('draws the corner marks at the tab bar corner on wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/about');

    const marks = await page.locator('.about-explore-marks').boundingBox();
    const bar = await page.locator('[data-explore-tabs]').boundingBox();
    expect(marks && bar).toBeTruthy();
    // The marks' bottom-right corner sits on the bar's top-left corner.
    expect(marks!.x + marks!.width).toBeCloseTo(bar!.x + 1, 0);
    expect(marks!.y + marks!.height).toBeCloseTo(bar!.y + 1, 0);
  });

  test('Twins in the Loop cards show author and ordinal date, and link to the blog', async ({
    page,
  }) => {
    await page.goto('/about');

    const section = page.locator('.about-twins-inner').locator('xpath=ancestor::section[1]');
    // Strapi-backed: hidden entirely when there are no posts.
    test.skip((await section.count()) === 0, 'No twins posts published in Strapi');

    await expect(section.getByRole('link', { name: /View all articles/ })).toHaveAttribute(
      'href',
      'https://twins-in-the-loop.com'
    );
    const meta = section.locator('.about-twins-card-meta').first();
    await expect(meta.locator('.about-twins-card-author')).toHaveText(/\S/);
    await expect(meta.locator('time')).toHaveText(
      /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(st|nd|rd|th), \d{4}$/
    );
  });

  test('Twins in the Loop has a module connector that spans its section', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/about');

    const section = page.locator('.about-twins-inner').locator('xpath=ancestor::section[1]');
    // Strapi-backed: hidden entirely when there are no posts.
    test.skip((await section.count()) === 0, 'No twins posts published in Strapi');

    const wrapper = section.locator('xpath=..');
    const connector = wrapper.locator(':scope > .module-connector');
    await expect(connector).toHaveCount(1);
    // The connector is positioned against the wrapper, so it is exactly as tall as the section.
    await expect(wrapper).toHaveCSS('position', 'relative');
    const [connectorBox, sectionBox] = await Promise.all([
      connector.boundingBox(),
      section.boundingBox(),
    ]);
    expect(connectorBox!.height).toBeCloseTo(sectionBox!.height, 0);
  });

  test('no longer lists the team on the page itself', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('Meet the people behind Datum')).toHaveCount(0);
  });

  test('collage progress follows the scroll position', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/about');

    const section = page.locator('[data-collage]');
    const progress = async () =>
      Number(await section.evaluate((el) => el.style.getPropertyValue('--p') || '0'));

    // Scroll offsets at which the section's top edge sits where progress is 0
    // (photo row entering) and 1 (section centred).
    const { start, end } = await section.evaluate((el) => {
      const height = el.offsetHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const viewport = window.innerHeight;
      return {
        start: top - (viewport - height * 0.67),
        end: top - (viewport - height) / 2,
      };
    });

    await page.evaluate((y) => window.scrollTo(0, y), start);
    await expect.poll(progress).toBeLessThan(0.05);

    await page.evaluate((y) => window.scrollTo(0, y), (start + end) / 2);
    await expect.poll(progress).toBeGreaterThan(0.4);
    await expect.poll(progress).toBeLessThan(0.6);

    await page.evaluate((y) => window.scrollTo(0, y), end);
    await expect.poll(progress).toBeGreaterThan(0.95);
  });

  test('collage section matches the design canvas instead of the viewport height', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1680, height: 1400 });
    await page.goto('/about');

    const height = await page.locator('[data-collage]').evaluate((el) => el.offsetHeight);
    expect(height).toBeGreaterThan(880);
    expect(height).toBeLessThan(900);
  });

  test('collage starts from its first state on very tall screens', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 2000 });
    await page.goto('/about');

    // The section is already on screen at scroll 0 here, but must not begin half-spread.
    await expect
      .poll(() =>
        page
          .locator('[data-collage]')
          .evaluate((el) => Number(el.style.getPropertyValue('--p') || '0'))
      )
      .toBeLessThan(0.05);
  });

  test('stacks the collage without horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.locator('.about-collage-photo')).toHaveCount(5);
  });

  test('serves markdown exports for both pages', async ({ request }) => {
    for (const path of ['/about.md', '/about/team.md', '/about/in-the-wild.md']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type']).toContain('text/markdown');
    }
  });
});

test.describe('In the wild page', () => {
  test('renders the wordmark, intro, and eleven stories', async ({ page }) => {
    await page.goto('/about/in-the-wild');

    await expect(page.getByRole('heading', { level: 1, name: 'in the wild' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toContainText('show up differently');
    await expect(page.locator('.wild-card')).toHaveCount(11);
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('In the Wild');
  });

  test('is listed in the sitemap', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(await response.text()).toContain('/about/in-the-wild');
  });

  test('pixelates a photo as it leaves the top of the screen', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 1000 });
    await page.goto('/about/in-the-wild');

    const media = page.locator('[data-wild-pixel]').first();
    await media.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      const el = document.querySelector('[data-wild-pixel]');
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + 40);
    });

    const strip = page.locator('.wild-pixel-strip.is-on').first();
    await expect(strip).toBeVisible();
    const box = await strip.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeLessThanOrEqual(80);
  });
});

test.describe('Team page', () => {
  test('renders the header and either the roster or the empty state', async ({ page }) => {
    await page.goto('/about/team');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Meet the people behind Datum'
    );
    // The grid is a server island, so wait for it to replace the skeleton.
    await expect(page.locator('.team-grid:not([aria-hidden]), .team-empty')).toBeVisible();
  });

  test('is listed in the sitemap', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(await response.text()).toContain('/about/team');
  });
});
