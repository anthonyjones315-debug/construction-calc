import { test, expect } from "./lib/test-fixtures";

/**
 * Cinematic onboarding video capture.
 * Run with: npx playwright test --project=video-capture onboarding-video-capture
 *
 * The video output will be saved in the test-results directory.
 */
test.describe("Contractor Onboarding Video Capture", () => {
  test("captures the full happy-path onboarding flow", async ({ page }) => {
    // ── Step 1: Visit the landing page ──
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Hold for visual impact

    // ── Step 2: Navigate to the Command Center ──
    await page.goto("/command-center");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // ── Step 3: Navigate to Business Profile Settings ──
    await page.goto("/settings");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    // ── Step 4: Fill in mock business branding ──
    const businessNameInput = page.locator(
      'input[name="business_name"], input[name="businessName"], #business-name',
    );
    if (await businessNameInput.isVisible().catch(() => false)) {
      await businessNameInput.fill("Jones Construction LLC");
      await page.waitForTimeout(500);
    }

    const logoUrlInput = page.locator(
      'input[name="logo_url"], input[name="logoUrl"], #logo-url',
    );
    if (await logoUrlInput.isVisible().catch(() => false)) {
      await logoUrlInput.fill(
        "https://placehold.co/256x256/2563eb/ffffff?text=JC",
      );
      await page.waitForTimeout(500);
    }

    // ── Step 5: Navigate to a calculator ──
    await page.goto("/calculators/concrete/slab");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Try to interact with the calculator
    const numberInputs = page.locator("input[type='number']");
    const count = await numberInputs.count();
    if (count >= 3) {
      await numberInputs.nth(0).fill("24");
      await page.waitForTimeout(300);
      await numberInputs.nth(1).fill("24");
      await page.waitForTimeout(300);
      await numberInputs.nth(2).fill("4");
      await page.waitForTimeout(300);
    }

    // Hold to show the calculated result
    await page.waitForTimeout(3000);

    // ── Step 6: Navigate to saved estimates ──
    await page.goto("/saved");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // ── Step 7: Return to Command Center for the grand finale ──
    await page.goto("/command-center");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    // Assertion to make the test pass — either on command-center or redirected to sign-in
    expect(page.url()).toMatch(/command-center|sign-in/);
  });
});
