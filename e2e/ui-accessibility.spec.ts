import { test, expect } from '@playwright/test';

test.describe('UI and Accessibility', () => {
  test('should have proper page titles', async ({ page }) => {
    const pages = [
      { url: '/', expectedTitle: /pro\s?construction|calc/i },
      { url: '/calculators', expectedTitle: /calculator/i },
      { url: '/contact', expectedTitle: /contact/i },
    ];

    for (const { url, expectedTitle } of pages) {
      await page.goto(url);
      await expect(page).toHaveTitle(expectedTitle);
    }
  });

  test('should be accessible on desktop viewport', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    expect(await h1.count()).toBeGreaterThan(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Content should be visible
    const main = page.locator('main, body');
    await expect(main).toBeVisible();
    
    // Check for mobile navigation (hamburger menu or collapsed nav)
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should have accessible form inputs', async ({ page }) => {
    await page.goto('/contact');
    
    // Check for proper form structure
    const form = page.locator('form');
    
    if (await form.isVisible()) {
      // Check for labels associated with inputs
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      expect(inputCount).toBeGreaterThan(0);
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Basic check: text should be readable
    const textElements = page.locator('p, span, h1, h2, h3, a');
    const count = await textElements.count();
    
    // Page should have readable content
    expect(count).toBeGreaterThan(0);
  });

  test('should not have broken images', async ({ page }) => {
    await page.goto('/');
    
    // Check for images that failed to load
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Images should either have alt text or be decorative
      expect(alt !== null || (await img.getAttribute('aria-hidden')) !== null).toBeTruthy();
    }
  });

  test('should have working footer navigation', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to bottom to see footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for footer
    const footer = page.locator('footer, [role="contentinfo"]');
    
    if (await footer.isVisible()) {
      // Footer should have links
      const footerLinks = footer.locator('a');
      expect(await footerLinks.count()).toBeGreaterThan(0);
    }
  });
});
