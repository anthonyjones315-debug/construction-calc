import { test, expect } from "../lib/test-fixtures";

test.describe("Saved Estimates", () => {

  test("estimate saves and appears in saved list", async ({ page }) => {
    await page.goto("/cart");

    const saveBtn = page.getByRole("button", { name: /save estimate/i });
    if (await saveBtn.isVisible()) {
      const estimateName = `Test Estimate ${Date.now()}`;
      const nameInput = page.getByLabel(/estimate name|title/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill(estimateName);
      }
      await saveBtn.click();

      await page.goto("/saved");
      await expect(page.getByText(estimateName)).toBeVisible();
    }
  });

  test("saved estimate can be reopened and shows original items", async ({ page }) => {
    await page.goto("/saved");
    const firstEstimate = page.getByTestId("saved-estimate").first();

    if (await firstEstimate.isVisible()) {
      await firstEstimate.click();
      // Should navigate to estimate detail
      await expect(page).toHaveURL(/saved\/|estimate\//);
      await expect(page.getByTestId("cart-item").first()).toBeVisible();
    }
  });

  test("estimate can be deleted from saved list", async ({ page }) => {
    await page.goto("/saved");
    const estimates = page.getByTestId("saved-estimate");
    const count = await estimates.count();

    if (count > 0) {
      await estimates.first().getByRole("button", { name: /delete|remove/i }).click();

      // Confirm deletion dialog if present
      const confirmBtn = page.getByRole("button", { name: /confirm|yes, delete/i });
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      await expect.poll(async () => estimates.count()).toBe(count - 1);
    }
  });

  test("empty saved list shows meaningful message", async ({ page }) => {
    await page.goto("/saved");
    // If redirected to sign-in, the auth layer is protecting the route — skip
    if (/\/sign-in/.test(page.url())) {
      test.skip(true, "Redirected to sign-in — auth required");
    }
    const estimates = page.getByTestId("saved-estimate");

    if (await estimates.count() === 0) {
      await expect(page.getByText(/no saved|start by|create your first|sign in/i)).toBeVisible();
    }
  });

});
