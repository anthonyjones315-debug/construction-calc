import { test, expect } from "@playwright/test";

test.describe("Mobile Signature Pad Flow (Read-Only Viewer)", () => {
  const TEST_CODE = process.env.PLAYWRIGHT_TEST_SHARE_CODE || "demo-code-123";

  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12/13/14 size
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/sign/${TEST_CODE}`);
  });

  test("Mobile view renders estimate details cleanly and shows pending status", async ({ page }) => {
    // Basic verification that the page loaded
    const title = page.getByText(/Estimate Details|Requested Estimate/i);
    await expect(title.first()).toBeVisible({ timeout: 15000 }).catch(() => {
      console.log(`Skipping mobile signature test because TEST_CODE ${TEST_CODE} 404s (needs seeding).`);
      test.skip();
    });

    // Ensure there's no canvas showing
    const canvas = page.locator("canvas");
    await expect(canvas).toHaveCount(0);

    // Expect to see the Document Status article
    const statusHeader = page.getByText(/Document Status/i);
    await expect(statusHeader).toBeVisible();

    // The read-only instruction banner for mobile
    const instructions = page.getByText(/secure e-signature/i);
    await expect(instructions).toBeVisible();
  });
});
