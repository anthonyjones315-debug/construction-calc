import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display main navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for main header/nav elements
    const navbar = page.locator('nav, [role="navigation"]');
    await expect(navbar).toBeVisible();
    
    // Check for main CTA buttons
    const ctaButtons = page.locator('a, button').filter({ hasText: /calculators|explore|get started/i });
    expect(await ctaButtons.count()).toBeGreaterThan(0);
  });

  test('should have working links to calculators and main pages', async ({ page }) => {
    await page.goto('/');
    
    // Find and click calculators link
    const calculatorsLink = page.locator('a').filter({ hasText: /calculators/i }).first();
    await expect(calculatorsLink).toBeVisible();
    
    // Navigate to calculators page
    await calculatorsLink.click();
    await expect(page).toHaveURL(/\/calculators/);
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is still visible and not overflowing
    const body = page.locator('body');
    const boundingBox = await body.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });
});

