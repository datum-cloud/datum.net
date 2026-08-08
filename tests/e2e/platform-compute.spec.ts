import { test, expect } from '@playwright/test';

const PATH = '/platform/compute';

test.describe('Compute product page', () => {
  test('renders every section', async ({ page }) => {
    await page.goto(PATH);

    await expect(page).toHaveTitle(/./);
    await expect(page.locator('#compute-hero-title')).toBeVisible();
    await expect(page.locator('#performance')).toBeVisible();
    await expect(page.locator('#use-cases')).toBeVisible();
    await expect(page.locator('#features')).toBeVisible();
  });

  test('accordion keeps exactly one panel open', async ({ page }) => {
    await page.goto(PATH);

    const panels = page.locator('.compute-accordion-panel');
    const sandboxes = page.locator('#sandboxes .compute-accordion-toggle');
    const aiAgents = page.locator('#ai-agents .compute-accordion-toggle');

    // Sandboxes is open on load, per the Figma default state.
    await expect(sandboxes).toHaveAttribute('aria-expanded', 'true');
    await expect(panels.locator('visible=true')).toHaveCount(1);

    await aiAgents.click();
    await expect(aiAgents).toHaveAttribute('aria-expanded', 'true');
    await expect(sandboxes).toHaveAttribute('aria-expanded', 'false');
    await expect(panels.locator('visible=true')).toHaveCount(1);
  });

  test('feature tabs swap the visible panel', async ({ page }) => {
    await page.goto(PATH);

    const panels = page.locator('.compute-feature-panel');
    await expect(page.locator('#forking-tab')).toHaveAttribute('aria-selected', 'true');
    await expect(panels.locator('visible=true')).toHaveCount(1);

    await page.locator('#autoscale-tab').click();
    await expect(page.locator('#autoscale-tab')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#forking-tab')).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#autoscale-panel')).toBeVisible();
    await expect(panels.locator('visible=true')).toHaveCount(1);
  });

  test('hero headline cycles its accent phrase, one line per phrase', async ({ page }) => {
    await page.goto(PATH);
    await page.evaluate(() => document.fonts.ready);

    const phrase = page.locator(
      '.compute-headline-phrase-slot > .compute-headline-phrase:not(.compute-headline-phrase--sizer)'
    );
    const first = await phrase.innerText();

    // A phrase must never break mid-way, so it always occupies one line box.
    const lineBoxes = () => phrase.evaluate((el) => el.getClientRects().length);
    expect(await lineBoxes()).toBe(1);

    await expect(phrase).not.toHaveText(first, { timeout: 8000 });
    expect(await lineBoxes()).toBe(1);
  });

  test('meter bars grow from zero when the card is revealed', async ({ page }) => {
    await page.goto(PATH);

    const fills = page.locator('.compute-meter-fill');
    const widths = () =>
      fills.evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).width)));

    // Off-screen the bars are empty. `is-armed` implies `is-ready` and lands a
    // frame later, once the collapsed state has painted.
    await expect(page.locator('.compute-meter-list')).toHaveClass(/is-armed/);
    expect((await widths()).every((w) => w < 2)).toBe(true);

    await page.locator('.compute-meter-card').scrollIntoViewIfNeeded();

    const track = await page
      .locator('.compute-meter-track')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).width));

    // Wait for the longest bar to settle — traditional VM has the longest delay
    // and a ~3.2s travel to match its slow boot time.
    await expect.poll(async () => (await widths())[2] >= track - 1, { timeout: 6000 }).toBe(true);

    // Widths land in the designed proportion: 5% / 29% / 100% of the track.
    const [micro, container, vm] = await widths();
    expect(micro).toBeGreaterThan(2);
    expect(micro).toBeLessThan(container);
    expect(container).toBeLessThan(vm);
    expect(vm).toBeCloseTo(track, 0);
  });

  test('meter bars still animate when the card is on screen at load', async ({ browser }) => {
    // Tall viewport: the card is already in view before any scrolling, which is
    // where the reveal used to be skipped — the observer reported it visible
    // while transitions were still disabled, so the bars snapped to full length.
    const context = await browser.newContext({ viewport: { width: 1680, height: 1800 } });
    const page = await context.newPage();
    await page.goto(PATH);

    const list = page.locator('.compute-meter-list');
    await expect(list).toBeInViewport();

    // Observation must not begin before arming, so the two classes can never be
    // observed apart in that order.
    await expect
      .poll(async () => list.evaluate((el) => el.classList.contains('is-inview')), {
        timeout: 5000,
      })
      .toBe(true);
    await expect(list).toHaveClass(/is-armed/);

    const duration = await page
      .locator('.compute-meter-fill')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).not.toBe('0s');

    await context.close();
  });

  test('meter bars skip the reveal under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(PATH);

    // No `.is-ready` means the base rules stand, so the chart is never empty
    // for anyone who can't see (or has opted out of) the animation.
    await expect(page.locator('.compute-meter-list')).not.toHaveClass(/is-ready/);
    const widths = await page
      .locator('.compute-meter-fill')
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).width)));
    expect(widths.every((w) => w > 2)).toBe(true);

    await context.close();
  });

  test('serves a markdown twin', async ({ request }) => {
    const response = await request.get(`${PATH}.md`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/markdown');

    const body = await response.text();
    expect(body).toContain('# Build ephemeral databases that cold-start in 10 milliseconds');
    expect(body).toContain('## Use Cases');
    expect(body).toContain('## Virtual machines that are tiny and mighty');
  });

  test('has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PATH);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
