import { test, expect } from '@playwright/test';
import { parfumFilters } from '../TestData/Filters';

test.describe('Douglas Parfum Filters - Data Driven Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Step 1: Navigate to website
    await page.goto('https://www.douglas.de/de', { waitUntil: 'domcontentloaded' });

    // Step 2: Handle cookie consent
    const acceptCookies = page.locator('button:has-text("Alle akzeptieren")');
    if (await acceptCookies.isVisible()) {
      await acceptCookies.click();
    }

    // Step 3: Click on Parfum
    await page.locator('a:has-text("Parfum")').first().click();

    // Verify Parfum page is opened
    await expect(page).toHaveURL(/parfum/);
  });

  // Step 4: Data-driven filter tests
  for (const filter of parfumFilters) {
    test(`Verify products are listed for filter: ${filter.category} - ${filter.value}`, async ({ page }) => {

      // Expand filter category
      const filterCategory = page.locator(`text=${filter.category}`).first();
      await filterCategory.scrollIntoViewIfNeeded();
      await filterCategory.click();

      // Select filter value
      const filterValue = page.locator(`label:has-text("${filter.value}")`);
      await filterValue.scrollIntoViewIfNeeded();
      await filterValue.click();

      // Wait for product list to refresh
      await page.waitForLoadState('networkidle');

      // Validate product list is displayed
      const products = page.locator('[data-testid="product-tile"]');
      await expect(products.first()).toBeVisible();

      // Optional: Validate product count > 0
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });
  }
});
