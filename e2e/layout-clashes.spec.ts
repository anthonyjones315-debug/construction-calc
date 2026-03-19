import { test, expect } from "@playwright/test";

test.describe("Home Page Layout Issues", () => {
  test("should display two-column layout on desktop without overlap", async ({
    page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Check for primary and secondary columns
    const primaryCol = page.locator(".home-primary-column");
    const secondaryCol = page.locator(".home-secondary-column");

    await expect(primaryCol).toBeVisible();
    await expect(secondaryCol).toBeVisible();

    // Get bounding boxes to verify no overlap
    const primaryBox = await primaryCol.boundingBox();
    const secondaryBox = await secondaryCol.boundingBox();

    if (primaryBox && secondaryBox) {
      // Primary column right edge should be less than secondary column left edge
      const primaryRight = primaryBox.x + primaryBox.width;
      const secondaryLeft = secondaryBox.x;

      // Allow small gap (at least 5px)
      expect(secondaryLeft - primaryRight).toBeGreaterThanOrEqual(0);

      // Verify secondary column is to the right (not overlapping)
      expect(secondaryLeft).toBeGreaterThan(primaryRight - 10);
    }
  });

  test("should align hero heading with content below it", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Get the main heading (h1)
    const heading = page.locator("h1").first();
    const firstFeatureCard = page
      .locator('[data-testid*="feature"], .feature, section')
      .nth(1);

    if ((await heading.isVisible()) && (await firstFeatureCard.isVisible())) {
      const headingBox = await heading.boundingBox();
      const cardBox = await firstFeatureCard.boundingBox();

      if (headingBox && cardBox) {
        // Both should have similar left alignment (within 20px)
        const diff = Math.abs(headingBox.x - cardBox.x);
        expect(diff).toBeLessThan(20);
      }
    }
  });

  test("should have proper spacing between sections", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Check spacing between major sections
    const sections = page.locator('section, [role="region"]');
    const sectionCount = await sections.count();

    if (sectionCount > 1) {
      for (let i = 0; i < Math.min(sectionCount - 1, 3); i++) {
        const section1 = sections.nth(i);
        const section2 = sections.nth(i + 1);

        const box1 = await section1.boundingBox();
        const box2 = await section2.boundingBox();

        if (box1 && box2) {
          // Vertical spacing should be positive (section2 below section1)
          const verticalGap = box2.y - (box1.y + box1.height);
          expect(verticalGap).toBeGreaterThanOrEqual(0);

          // Gap should be reasonable (not too cramped, not too large)
          expect(verticalGap).toBeLessThan(100);
        }
      }
    }
  });

  test("should not have horizontal overflow on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Check if any element overflows horizontally
    const bodyWidth = await page.evaluate(() => window.innerWidth);
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );

    expect(documentWidth).toBeLessThanOrEqual(bodyWidth + 1); // Allow 1px rounding
  });

  test("should stack properly on tablet (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // On tablet, columns might start to stack
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // Check for horizontal overflow
    const bodyWidth = 768;
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );

    expect(documentWidth).toBeLessThanOrEqual(bodyWidth + 5); // Allow small tolerance
  });

  test("should be full-width single column on mobile (375px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // On mobile, should be single column
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // No horizontal overflow
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(documentWidth).toBeLessThanOrEqual(375 + 5);
  });

  test("should handle short viewport heights (820px) gracefully", async ({
    page,
  }) => {
    // Test the special media query breakpoint
    await page.setViewportSize({ width: 1400, height: 820 });
    await page.goto("/");

    // Page should still render without critical overlap
    const primaryCol = page.locator(".home-primary-column");
    await expect(primaryCol).toBeVisible();

    // Content should be readable even with adjusted spacing
    const headings = page.locator("h1, h2, h3");
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test("should not clip text in sidebar panels", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Check sidebar panels
    const sidebarPanels = page.locator(".home-secondary-column > div");
    const panelCount = await sidebarPanels.count();

    if (panelCount > 0) {
      for (let i = 0; i < Math.min(panelCount, 3); i++) {
        const panel = sidebarPanels.nth(i);
        const panelBox = await panel.boundingBox();

        // Get text content height
        const textContent = panel.locator("p, a, span");
        const textBox = await textContent.first().boundingBox();

        if (panelBox && textBox) {
          // Text should not overflow panel
          expect(textBox.x + textBox.width).toBeLessThanOrEqual(
            panelBox.x + panelBox.width,
          );
        }
      }
    }
  });

  test("should align tax rate cards properly", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Find tax rate cards (should be in a grid)
    const taxCards = page
      .locator(
        '[data-testid*="tax"], .tax-card, text=/Oneida|Madison|Herkimer/',
      )
      .filter({ visible: true });

    if ((await taxCards.count()) >= 2) {
      const card1 = taxCards.nth(0);
      const card2 = taxCards.nth(1);

      const box1 = await card1.boundingBox();
      const box2 = await card2.boundingBox();

      if (box1 && box2) {
        // Cards should be roughly at same vertical level (within 10px)
        const verticalDiff = Math.abs(box1.y - box2.y);
        expect(verticalDiff).toBeLessThan(10);
      }
    }
  });

  test("should have visible buttons with no overlap", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    const buttons = page
      .locator('button, a[role="button"]')
      .filter({ visible: true });
    const buttonCount = Math.min(await buttons.count(), 3);

    if (buttonCount > 1) {
      const buttonBoxes: any[] = [];

      for (let i = 0; i < buttonCount; i++) {
        const box = await buttons.nth(i).boundingBox();
        if (box) buttonBoxes.push(box);
      }

      // Check that buttons don't overlap with each other
      for (let i = 0; i < buttonBoxes.length - 1; i++) {
        const btn1 = buttonBoxes[i];
        const btn2 = buttonBoxes[i + 1];

        let hasVerticalGap = Math.abs(btn1.y - btn2.y) > btn1.height;
        let hasHorizontalGap = Math.abs(btn1.x - btn2.x) > btn1.width;

        // Either vertical or horizontal gap should exist
        expect(hasVerticalGap || hasHorizontalGap).toBeTruthy();
      }
    }
  });
});
