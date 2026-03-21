import { test, expect } from "@playwright/test";

test.describe("Billing — Free Tier Paywall Behavior", () => {
  const openCommandCenterOrSkip = async (
    page: Parameters<typeof test>[0]["page"],
  ) => {
    await page.goto("/command-center");
    if (/\/sign-in/.test(page.url())) {
      test.skip(true, "Requires authenticated free-tier test user");
    }
  };

  test("free user sees upgrade prompt, not a 500 error, on premium feature", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    // Try to access a premium feature — e.g., financial dashboard
    const premiumFeature = page.getByTestId("premium-feature");
    if (await premiumFeature.isVisible()) {
      await premiumFeature.click();

      // Should show upgrade prompt
      await expect(
        page.getByText(/upgrade|pro plan|unlock|subscription required/i),
      ).toBeVisible({ timeout: 3000 });

      // Should NOT show a 500 or crash
      await expect(page.getByText(/error|500|unhandled/i)).not.toBeVisible();
    }
  });

  test("free user can still use all calculators", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    // Dismiss cookie banner before interacting
    const acceptBtn = page.getByRole("button", { name: /accept/i });
    try {
      await acceptBtn.waitFor({ state: "visible", timeout: 4000 });
      await acceptBtn.click();
      await acceptBtn.waitFor({ state: "hidden", timeout: 3000 });
    } catch {
      /* banner not present */
    }

    // Core calculators should be available on free tier — use indexed number inputs
    const inputs = page.locator("input[type='number']");
    const inputCount = await inputs.count();
    if (inputCount === 0) test.skip(true, "No numeric inputs found");
    await inputs.nth(0).fill("20");
    if (inputCount > 1) await inputs.nth(1).fill("24");
    if (inputCount > 2) await inputs.nth(2).fill("4");

    // Result should auto-calculate — material list shows "Order X.XX Total Yards"
    await expect(page.getByText(/Order\s+[\d.]+/i).first()).toBeVisible();
  });

  test("upgrade CTA is visible and prominent on free tier", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    const upgradeCTA = page
      .getByRole("button", { name: /upgrade|go pro|subscribe/i })
      .or(page.getByRole("link", { name: /upgrade|go pro|subscribe/i }));

    await expect(upgradeCTA.first()).toBeVisible();
  });

  test("paywall modal has a working 'upgrade' link", async ({ page }) => {
    await openCommandCenterOrSkip(page);

    const premiumFeature = page.getByTestId("premium-feature");
    if (await premiumFeature.isVisible()) {
      await premiumFeature.click();

      const upgradeBtn = page
        .getByRole("button", { name: /upgrade now|subscribe/i })
        .or(page.getByRole("link", { name: /upgrade now|subscribe/i }));

      if (await upgradeBtn.isVisible()) {
        const [newPage] = await Promise.all([
          page
            .context()
            .waitForEvent("page")
            .catch(() => null),
          upgradeBtn.click(),
        ]);

        // Should navigate to checkout or internal /subscribe page
        const currentUrl = newPage ? newPage.url() : page.url();
        expect(currentUrl).toMatch(/checkout|subscribe|billing|pricing/i);
      }
    }
  });

  test("feature limit message explains what they'd get by upgrading", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    const premiumFeature = page.getByTestId("premium-feature");
    if (await premiumFeature.isVisible()) {
      await premiumFeature.click();

      // Message should explain the value, not just say "no"
      const message = await page.getByTestId("paywall-message").textContent();
      if (message) {
        expect(message.length).toBeGreaterThan(20);
        expect(message).not.toMatch(/^(locked|no access|forbidden)\.?$/i);
      }
    }
  });
});
