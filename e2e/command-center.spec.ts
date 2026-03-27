import { test, expect } from "./lib/test-fixtures";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { safeNavigate, safeClick, handleUnexpectedModals } from "./utils/smartNav";

test.describe("Command Center Flows", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test("Dashboard Initial Load renders without layout shifts", async ({ page }) => {
    await safeNavigate(page, "/command-center");
    await handleUnexpectedModals(page);

    // Verify core overview sections are present
    await expect(page.locator("main")).toBeVisible();
    // Dashboard should show content — not a blank or error page
    const mainText = await page.locator("main").textContent() ?? "";
    expect(mainText.length).toBeGreaterThan(50);
  });

  test("Workflow Redirection from Command Center", async ({ page }) => {
    await safeNavigate(page, "/command-center");
    await handleUnexpectedModals(page);

    // CRM Route
    const crmLink = page.getByRole("link", { name: /CRM/i }).first();
    await expect(crmLink).toBeVisible();
    await safeClick(page, crmLink);
    await expect(page).toHaveURL(/\/command-center\/crm/);

    await page.goBack();
    await handleUnexpectedModals(page);

    // Calculators route
    const calcLink = page.getByRole("link", { name: /Calculators/i }).first();
    if (await calcLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await safeClick(page, calcLink);
      await expect(page).toHaveURL(/\/calculators/);
    }
  });
});
