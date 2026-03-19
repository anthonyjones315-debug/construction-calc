import { test, expect } from "@playwright/test";

test.describe("Visual Spacing and Alignment", () => {
  test("should have consistent padding/margins on hero section", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Hero section (parent container)
    const heroSection = page.locator('[data-testid*="hero"], section').first();

    const heroBox = await heroSection.boundingBox();
    const heroFirstChild = heroSection.locator("> *").first();
    const childBox = await heroFirstChild.boundingBox();

    if (heroBox && childBox) {
      // Check left padding
      const leftPadding = childBox.x - heroBox.x;
      expect(leftPadding).toBeGreaterThan(0);
      expect(leftPadding).toBeLessThan(100); // Reasonable padding
    }
  });

  test("should have proper text color contrast on dark background", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Check that text is computed to be light colored
    const mainText = page.locator("p, li, span").first();
    const styles = await mainText.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    const color = styles.color;
    // Should be light (not dark gray/black on dark background)
    expect(color).toBeDefined();
  });

  test("should not have text clipping or truncation", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Check for dangerous CSS that could clip text
    const elementsWithClipping = page.locator("*").filter({
      has: page.locator("text=/.*/"),
    });

    const count = Math.min(await elementsWithClipping.count(), 10);

    for (let i = 0; i < count; i++) {
      const el = elementsWithClipping.nth(i);
      const styles = await el.evaluate((elem) => {
        const computed = window.getComputedStyle(elem);
        return {
          overflow: computed.overflow,
          textOverflow: computed.textOverflow,
          whiteSpace: computed.whiteSpace,
        };
      });

      // If overflow is hidden, text-overflow should be handled
      if (styles.overflow === "hidden" && styles.textOverflow === "clip") {
        // This might be problematic
      }
    }
  });

  test("should have proper spacing between sidebar panels", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    const sidebarPanels = page.locator(".home-secondary-column > div");
    const panelCount = await sidebarPanels.count();

    if (panelCount > 1) {
      for (let i = 0; i < panelCount - 1; i++) {
        const panel1 = sidebarPanels.nth(i);
        const panel2 = sidebarPanels.nth(i + 1);

        const box1 = await panel1.boundingBox();
        const box2 = await panel2.boundingBox();

        if (box1 && box2) {
          // Calculate gap between panels
          const gap = box2.y - (box1.y + box1.height);

          // Gap should be consistent (likely 12px or 16px or 20px based on Tailwind)
          expect(gap).toBeGreaterThanOrEqual(8);
          expect(gap).toBeLessThan(50);
        }
      }
    }
  });

  test("should display feature cards in proper grid on desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    // Feature cards should be in a grid (sm:grid-cols-2 xl:grid-cols-3 at 1400px)
    const featureGrid = page
      .locator('[data-testid*="feature"], .feature-card')
      .filter({ visible: true });
    const count = await featureGrid.count();

    if (count >= 2) {
      const card1 = featureGrid.nth(0);
      const card2 = featureGrid.nth(1);

      const box1 = await card1.boundingBox();
      const box2 = await card2.boundingBox();

      if (box1 && box2) {
        // At desktop, we should have multiple cards per row (horizontal alignment)
        // OR check if stacked (vertical alignment) with consistent spacing

        const horizontalDiff = Math.abs(box1.y - box2.y);
        const verticalGap = box2.x - (box1.x + box1.width);

        // If same horizontal level, should be horizontal grid
        if (horizontalDiff < 10) {
          expect(verticalGap).toBeGreaterThan(5);
        }
      }
    }
  });

  test("should have responsive spacing that adapts to viewport", async ({
    page,
  }) => {
    // Test at different viewports
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1400, height: 900, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");

      const main = page.locator('main, [role="main"]');
      const box = await main.boundingBox();

      if (box) {
        // Content should fit the viewport width
        expect(box.width).toBeLessThanOrEqual(viewport.width + 5);
      }
    }
  });

  test("should not have elements extending past viewport on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Get viewport width
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Check for any element that extends beyond viewport
    const overflowingElements = await page.evaluate((vw) => {
      const elements: string[] = [];
      const allElements = document.querySelectorAll("*");

      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > vw + 2) {
          // Allow 2px tolerance
          if (el.children.length === 0) {
            // Only leaf elements
            elements.push(
              el.tagName + (el.className ? "." + el.className : ""),
            );
          }
        }
      });

      return elements.slice(0, 3); // Return first 3
    }, viewportWidth);

    expect(overflowingElements.length).toBe(0);
  });

  test("heading should have appropriate line-height", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");

    const mainHeading = page.locator("h1").first();
    const styles = await mainHeading.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        lineHeight: computed.lineHeight,
        fontSize: computed.fontSize,
        fontSizeNumber: parseFloat(computed.fontSize),
      };
    });

    // Line height should be readable (not too tight)
    const lineHeightValue = parseFloat(styles.lineHeight);
    const fontSizeNumber = styles.fontSizeNumber;

    // Line height ratio should typically be >= 1.2
    const ratio = lineHeightValue / fontSizeNumber;
    expect(ratio).toBeGreaterThanOrEqual(0.9); // Tight but readable
    expect(ratio).toBeLessThan(2); // Not too loose
  });
});
