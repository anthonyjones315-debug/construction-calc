import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/construction|calc/i);
  });

  test('should have main content', async ({ page }) => {
    await page.goto('/');
    // Check if page has some main content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should be able to navigate between pages', async ({ page }) => {
    await page.goto('/');
    // Add your navigation tests here
  });
});
