import { test, expect } from '@playwright/test';

// The changelog comes from GitHub Discussions; without credentials the page has no entries,
// so these tests skip instead of failing.
test.describe('Changelog search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/changelog');
    const entries = page.locator('.changelog-entry');
    await entries
      .first()
      .waitFor({ timeout: 15000 })
      .catch(() => undefined);
    test.skip((await entries.count()) === 0, 'No changelog entries available in this environment');
  });

  test('shows results in a dropdown and jumps to the entry with the keyboard', async ({ page }) => {
    const title = (await page.locator('.changelog-entry-nav-title').first().innerText()).trim();
    const word = title.split(/\s+/).find((w) => w.length > 3) ?? title;
    const entryId = await page.locator('.changelog-entry').first().getAttribute('id');

    const input = page.getByRole('combobox', { name: 'Search changelog' });
    await input.click();
    await input.fill(word);

    const listbox = page.getByRole('listbox', { name: 'Changelog results' });
    await expect(listbox).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(await listbox.getByRole('option').count()).toBeGreaterThan(0);
    // Searching no longer hides entries from the page.
    await expect(page.locator('.changelog-entry[hidden]')).toHaveCount(0);

    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', /changelog-option-0/);
    await input.press('Enter');

    await expect(listbox).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`#${entryId}$`));
    await expect(page.locator(`[id="${entryId}"]`)).toBeInViewport();
  });

  test('Escape closes the list first, then clears the field', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Search changelog' });
    const listbox = page.getByRole('listbox', { name: 'Changelog results' });

    await input.click();
    await input.fill('a');
    await expect(listbox).toBeVisible();

    await input.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue('a');
    await expect(input).toBeFocused();

    await input.press('Escape');
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
  });

  test('says so when nothing matches', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Search changelog' });
    await input.click();
    await input.fill('zzqxkvv');
    await expect(page.getByRole('listbox', { name: 'Changelog results' })).toContainText(
      'No matching changes.'
    );
  });
});
