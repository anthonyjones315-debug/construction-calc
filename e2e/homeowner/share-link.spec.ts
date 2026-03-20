import { test, expect, devices } from "@playwright/test";
import { dismissCookieConsent } from "../utils/cookie-consent";

// The homeowner has NO account. Run against the no-auth project.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Homeowner — Public Estimate Share Link", () => {
  // Replace with a known test share code seeded in your test DB
  const SHARE_CODE = process.env.TEST_SHARE_CODE ?? "test-share-abc123";

  const openShareOrSkip = async (page: Parameters<typeof test>[0]["page"]) => {
    await page.goto(`/sign/${SHARE_CODE}`);
    await dismissCookieConsent(page);

    const unavailable = page
      .getByText(/page not found|expired|invalid|no longer available/i)
      .first();
    if (await unavailable.isVisible().catch(() => false)) {
      test.skip(
        true,
        "Valid TEST_SHARE_CODE seed not available in this environment",
      );
    }
  };

  test("share link loads without requiring sign-in", async ({ page }) => {
    await openShareOrSkip(page);

    // Should NOT redirect to auth
    await expect(page).not.toHaveURL(/auth\/signin|register/);
    await expect(
      page.getByText(/estimate|proposal|quote|sign/i).first(),
    ).toBeVisible();
  });

  test("estimate shows contractor name prominently", async ({ page }) => {
    await openShareOrSkip(page);

    // Contractor identity must be visible — this is a trust signal for the homeowner
    await expect(
      page.getByText(/contracting|construction|llc|inc/i).first(),
    ).toBeVisible();
  });

  test("line items are visible and labeled in plain language", async ({
    page,
  }) => {
    await openShareOrSkip(page);

    const lineItems = page.getByTestId("estimate-line-item");
    await expect(lineItems.first()).toBeVisible();

    // Line item should have a description, not just a code
    const firstDesc = await lineItems.first().textContent();
    expect(firstDesc?.trim().length).toBeGreaterThan(5);
    // Should NOT be raw codes like "CY" alone
    expect(firstDesc).not.toMatch(/^\s*(CY|SF|LF|EA)\s*$/);
  });

  test("total amount is displayed clearly with tax broken out", async ({
    page,
  }) => {
    await openShareOrSkip(page);

    await expect(page.getByTestId("estimate-subtotal")).toBeVisible();
    await expect(page.getByTestId("estimate-tax")).toBeVisible();
    await expect(page.getByTestId("estimate-total")).toBeVisible();

    // Total should be in dollar format
    const totalText = await page.getByTestId("estimate-total").textContent();
    expect(totalText).toMatch(/\$[\d,]+(\.\d{2})?/);
  });

  test("invalid share code shows a friendly 404, not a crash", async ({
    page,
  }) => {
    await page.goto("/sign/this-code-does-not-exist-xyz999");

    await expect(
      page.getByText(/not found|expired|invalid|no longer available/i),
    ).toBeVisible();
    await expect(
      page.getByText(/unhandled exception|application error|500/i),
    ).not.toBeVisible();
  });

  test("share link loads correctly on iPhone SE viewport (320px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openShareOrSkip(page);

    // No horizontal scroll on smallest common phone
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(322);

    // Estimate content should still be visible
    await expect(page.getByTestId("estimate-total")).toBeVisible();
  });

  test("share link loads correctly on Safari-like WebKit", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices["iPhone 14"],
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto(`/sign/${SHARE_CODE}`);
    await dismissCookieConsent(page);

    const unavailable = page
      .getByText(/page not found|expired|invalid|no longer available/i)
      .first();
    if (await unavailable.isVisible().catch(() => false)) {
      test.skip(
        true,
        "Valid TEST_SHARE_CODE seed not available in this environment",
      );
    }

    await expect(page).not.toHaveURL(/auth\/signin/);
    await expect(
      page.getByText(/estimate|proposal|sign/i).first(),
    ).toBeVisible();
    await context.close();
  });

  test("estimate page has a clear call-to-action to sign", async ({ page }) => {
    await openShareOrSkip(page);

    const signBtn = page.getByRole("button", { name: /sign|approve|accept/i });
    await expect(signBtn).toBeVisible();

    // Button should be large enough to tap on mobile
    const box = await signBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(34);
  });

  test("already-signed estimate shows signed status, not the signature form again", async ({
    page,
  }) => {
    // Assumes a separate test share code for an already-signed estimate
    const SIGNED_CODE = process.env.TEST_SIGNED_SHARE_CODE;
    if (!SIGNED_CODE) test.skip();

    await page.goto(`/sign/${SIGNED_CODE}`);
    await dismissCookieConsent(page);
    await expect(page.getByText(/signed|approved|completed/i)).toBeVisible();

    // The signature pad should NOT appear again
    const signatureCanvas = page.getByTestId("signature-pad");
    await expect(signatureCanvas).not.toBeVisible();
  });
});
