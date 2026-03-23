import { test, expect } from "@playwright/test";
import path from "path";

/**
 * Visual Guide Generator
 * This test is specifically designed to run slowly and generate 
 * visual assets (screenshots/videos) that can be used in the platform's
 * interactive onboarding / how-to page. 
 * 
 * Command to run this visually: 
 * npx playwright test e2e/onboarding-guide-generator.spec.ts --project=chromium --ui
 */

test.describe("Onboarding Visual Guide Workflow", () => {
  // We use slowMo in the context if we want to visually pace it, 
  // or we can just use explicit waits.
  test.use({ 
    actionTimeout: 15000, 
    video: "on",      // Ensure video is recorded
    trace: "on"
  });

  test("Contractor Walkthrough: Login -> Calculator -> Estimate", async ({ page }, testInfo) => {
    // 1. Visit the root and click Sign In (or directly /auth/signin)
    await page.goto("/");
    
    // Simulate reading time for the viewer
    await page.waitForTimeout(1000);
    
    // 2. Navigate to Sign In
    await page.goto("/auth/signin");
    await page.waitForTimeout(500);

    // 3. Login 
    // Fill credentials (these could be demo credentials)
    const emailInput = page.getByLabel("Email");
    const passInput = page.getByLabel("Password");

    if (await emailInput.isVisible()) {
      await emailInput.fill(process.env.TEST_USER_EMAIL || "demo@proconstructioncalc.com");
      await page.waitForTimeout(300);
      await passInput.fill(process.env.TEST_USER_PASSWORD || "DemoPass123!");
      await page.waitForTimeout(500);

      const loginBtn = page.getByRole("button", { name: /sign in/i });
      await loginBtn.click();
    }

    // Wait until dashboard or main page is loaded
    await page.waitForTimeout(2000);

    // Take screenshot of the Command Center / Dashboard
    await page.screenshot({ path: path.join(testInfo.outputDir, "guide-step-1-dashboard.png") });

    // 4. Navigate to Concrete Calculators
    await page.goto("/calculators/concrete/slab");
    await page.waitForTimeout(1500);
    
    // Highlight inputs conceptually by filling them out slowly
    await page.getByLabel(/length/i).fill("30");
    await page.waitForTimeout(400);
    await page.getByLabel(/width/i).fill("24");
    await page.waitForTimeout(400);
    await page.getByLabel(/thickness/i).fill("6");
    await page.waitForTimeout(800);

    // Click calculate
    await page.getByRole("button", { name: /calculate/i }).click();

    // Show result
    const result = page.getByTestId("calc-result");
    await expect(result).toBeVisible();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(testInfo.outputDir, "guide-step-2-concrete-result.png") });

    // 5. Add to Estimate
    const addToEstBtn = page.getByRole("button", { name: /add to estimate|add to cart/i });
    if (await addToEstBtn.isVisible()) {
      await addToEstBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(testInfo.outputDir, "guide-step-3-added-to-cart.png") });
    }

    // 6. Navigate to Cart / Estimate builder
    await page.goto("/cart");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(testInfo.outputDir, "guide-step-4-estimate-builder.png") });

    // Ensure the video gets saved successfully
    await page.waitForTimeout(1000);
  });
});
