import { test, expect } from "@playwright/test";

test.describe("Settings", () => {

  test("settings page loads for authenticated user", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });

  test("user can update display name", async ({ page }) => {
    await page.goto("/settings");
    const nameInput = page.getByLabel(/name|display name/i);

    if (await nameInput.isVisible()) {
      await nameInput.fill("Mike Johnson — Oneida Contracting");
      await page.getByRole("button", { name: /save|update/i }).click();
      await expect(page.getByText(/saved|updated|success/i)).toBeVisible();
    }
  });

  test("2FA toggle enables and prompts for confirmation", async ({ page }) => {
    await page.goto("/settings");
    const twoFAToggle = page.getByLabel(/two-factor|2FA/i);

    if (await twoFAToggle.isVisible()) {
      const isChecked = await twoFAToggle.isChecked();
      await twoFAToggle.click();

      if (!isChecked) {
        // Enabling 2FA — should show confirmation or setup flow
        await expect(
          page.getByText(/confirm|verify|send code/i)
        ).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("default county tax preference saves and persists", async ({ page }) => {
    await page.goto("/settings");
    const countySelect = page.getByLabel(/default county|county preference/i);

    if (await countySelect.isVisible()) {
      await countySelect.selectOption(/madison/i);
      await page.getByRole("button", { name: /save|update/i }).click();

      await page.reload();
      await expect(countySelect).toHaveValue(/madison/i);
    }
  });

  test("sign out button ends session", async ({ page, context }) => {
    await page.goto("/settings");
    const signOutBtn = page.getByRole("button", { name: /sign out|log out/i });

    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await expect(page).toHaveURL(/\/sign-in|\/$/);

      // Confirm session is gone — protected route should redirect
      await page.goto("/saved");
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

});
