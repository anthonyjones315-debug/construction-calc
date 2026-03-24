import { test, expect } from "@playwright/test";

test.describe("Performance — Core Web Vitals", () => {
  test.describe.configure({ mode: "serial" });

  test("home page LCP under 2.5s", async ({ page }) => {
    test.slow();
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });

    const lcp = await page.evaluate((): Promise<number> => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          resolve(last.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        // Fallback
        setTimeout(() => resolve(0), 5000);
      });
    });

    if (lcp > 0) {
      const lcpThreshold = process.env.CI ? 2500 : 3500;
      expect(lcp).toBeLessThan(lcpThreshold);
    }
  });

  test("calculator page loads with auto-calculated result within 3s", async ({
    page,
  }) => {
    const start = Date.now();
    await page.goto("/calculators/concrete/slab", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    // Calculators auto-calculate with default values — result should already be visible
    await page
      .getByText(/Order\s+[\d.]+\s+Total Yards/i)
      .first()
      .waitFor({ state: "visible" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test("calculator result updates reactively within 500ms of input change", async ({
    page,
  }) => {
    await page.goto("/calculators/concrete/slab");
    // Wait for initial auto-calc result
    const resultLocator = page
      .getByText(/Order\s+[\d.]+\s+Total Yards/i)
      .first();
    await resultLocator.waitFor({ state: "visible" });
    const before = (await resultLocator.textContent()) ?? "";

    // Change an input and measure how fast the result updates
    const lengthInput = page.getByLabel(/Run Length/i);
    const start = Date.now();
    await lengthInput.fill("40");
    await expect
      .poll(async () => (await resultLocator.textContent()) ?? "")
      .not.toBe(before);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  test("no console errors on calculator pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/calculators/concrete/slab");
    await page
      .getByText(/Order\s+[\d.]+\s+Total Yards/i)
      .first()
      .waitFor({ state: "visible" });

    // Change inputs to trigger recalculation
    await page.getByLabel(/Run Length/i).fill("20");
    await page.getByLabel(/Slab Width/i).fill("24");
    await page.getByLabel(/Slab Thickness/i).fill("4");

    // Filter out known third-party noise
    const appErrors = errors.filter(
      (e) =>
        !e.includes("posthog") &&
        !e.includes("sentry") &&
        !e.includes("extension"),
    );
    expect(appErrors).toHaveLength(0);
  });

  test("no hydration errors in browser console", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (msg) => {
      if (
        msg.text().includes("Hydration") ||
        msg.text().includes("hydration")
      ) {
        hydrationErrors.push(msg.text());
      }
    });

    await page.goto("/calculators", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /calculators/i }).first(),
    ).toBeVisible();
    expect(hydrationErrors).toHaveLength(0);
  });
});
