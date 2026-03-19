import { test, expect } from "@playwright/test";

test.describe("PWA and Mobile Readiness", () => {
  test("exposes valid manifest metadata", async ({ page }) => {
    await page.goto("/");

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", "/app.webmanifest");

    const response = await page.request.get("/app.webmanifest");
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.name).toBe("Pro Construction Calc");
    expect(manifest.display).toBe("standalone");
    expect(Array.isArray(manifest.icons)).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test("serves service worker with required headers", async ({ page }) => {
    const response = await page.request.get("/sw.js");
    expect(response.ok()).toBeTruthy();

    const contentType = response.headers()["content-type"];
    const serviceWorkerAllowed = response.headers()["service-worker-allowed"];

    expect(contentType).toContain("application/javascript");
    expect(serviceWorkerAllowed).toBe("/");

    const body = await response.text();
    expect(body).toContain('self.addEventListener("fetch"');
  });

  test("offline page is usable on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/offline");

    await expect(
      page.getByRole("heading", { name: /you're offline/i }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: /^calculators$/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /^saved$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^guide$/i })).toBeVisible();
  });

  test("key mobile pages do not overflow viewport width", async ({ page }) => {
    const paths = ["/", "/calculators", "/offline"];

    await page.setViewportSize({ width: 390, height: 844 });

    for (const path of paths) {
      await page.goto(path);
      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
    }
  });

  test("home primary actions are touch-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const primaryAction = page.getByRole("link", {
      name: /start new estimate/i,
    });
    await expect(primaryAction).toBeVisible();

    const box = await primaryAction.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("iOS Install Guidance", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 390, height: 844 },
  });

  test("shows Add to Home Screen guidance on iOS", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.removeItem("pwa_dismissed");
      } catch {
        // ignore
      }
    });

    await page.goto("/");

    await expect(
      page.getByRole("banner", { name: /install pro construction calc/i }),
    ).toBeVisible();

    await expect(page.getByText(/add to home screen/i)).toBeVisible();
  });
});
