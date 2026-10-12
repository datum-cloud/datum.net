import { test, expect, type Page } from '@playwright/test';

// The nav asks cloud-portal who is signed in; the response decides which
// items the desktop user menu offers.
const signedIn = (org: Record<string, unknown>) => ({
  signedIn: true,
  user: { displayName: 'Ada Lovelace', email: 'ada@example.com' },
  org: { name: 'acme', displayName: 'Acme', ...org },
  dashboardUrl: 'https://cloud.datum.net/onboarding',
});

const openUserMenu = async (page: Page, status: unknown) => {
  await page.route('**/api/website/session-status', (route) => route.fulfill({ json: status }));
  await page.goto('/');
  const trigger = page.locator('.nav-actions [data-portal-user-menu-trigger]');
  await expect(trigger).toHaveText(/Ada Lovelace/);
  await trigger.click();
  return page.locator('[data-portal-user-menu]');
};

test.describe('Nav user menu', () => {
  test('hides Projects when the org has no projects', async ({ page }) => {
    // Linking to an empty projects page would be a dead end for new users.
    const menu = await openUserMenu(page, signedIn({ hasProjects: false }));
    await expect(menu).toBeVisible();
    await expect(menu.locator('[data-portal-user-menu-projects]')).toHaveCount(0);
  });

  test('keeps Projects when the portal could not tell whether projects exist', async ({ page }) => {
    // cloud-portal omits hasProjects when its lookup fails; a Milo blip must
    // not hide the link from users who do have projects.
    const menu = await openUserMenu(page, signedIn({}));
    await expect(menu.locator('[data-portal-user-menu-projects]')).toHaveAttribute(
      'href',
      /\/org\/acme\/projects$/
    );
  });

  test('keeps Projects when the org has projects', async ({ page }) => {
    const menu = await openUserMenu(page, signedIn({ hasProjects: true }));
    await expect(menu.locator('[data-portal-user-menu-projects]')).toHaveAttribute(
      'href',
      /\/org\/acme\/projects$/
    );
  });
});
