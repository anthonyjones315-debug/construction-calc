import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["Pixel 7"] });

test.describe("PWA — Mobile Experience", () => {

  test("app loads on mobile viewport without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 390;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 2); // 2px tolerance
  });

  test("calculator inputs are large enough to tap without zooming", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    const inputs = page.getByRole("spinbutton"); // number inputs

    const count = await inputs.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await inputs.nth(i).boundingBox();
      // Minimum touch target: 44x44px (Apple HIG)
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("calculator action buttons are tappable without mis-hit", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Yards/i).waitFor({ state: "visible" });

    // Check "Save Estimate" or "Finalize" buttons are tappable
    const actionBtn = page.getByRole("button", { name: /Save Estimate|Finalize/i }).first();
    if (await actionBtn.isVisible()) {
      const box = await actionBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(100);
    }
  });

  test("navigation menu works on mobile (hamburger or bottom nav)", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /menu|open navigation/i });

    if (await hamburger.isVisible()) {
      await hamburger.click();
      await expect(page.getByRole("navigation")).toBeVisible();
    } else {
      // Bottom navigation bar
      await expect(page.getByRole("navigation")).toBeVisible();
    }
  });

  test("service worker registers on first load", async ({ page }) => {
    await page.goto("/");
    const swRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });
    expect(swRegistered).toBe(true);
  });

  test("offline fallback page appears when network is down", async ({ page, context }) => {
    // Load the app first so SW caches it
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Simulate offline
    await context.setOffline(true);
    await page.goto("/calculators/concrete/slab");

    // Either page loads from cache, or offline fallback shows
    const title = await page.title();
    expect(title).not.toMatch(/ERR_|Failed|Cannot/);
    expect(
      (await page.getByText(/offline|no connection|cached version/i).isVisible()) ||
      (await page.getByText(/slab/i).isVisible())
    ).toBe(true);

    await context.setOffline(false);
  });

  test("keyboard does not obscure input fields on iOS-style viewport", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    const firstInput = page.getByRole("spinbutton").first();
    await firstInput.click();

    // After keyboard would appear, the input should still be in viewport
    const box = await firstInput.boundingBox();
    const viewport = page.viewportSize();
    // Input should not be below the fold
    expect(box?.y ?? 0).toBeLessThan((viewport?.height ?? 844) * 0.8);
  });

});
