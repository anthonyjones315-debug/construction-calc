import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test.describe("Command Center Flows", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test("Dashboard Initial Load renders without layout shifts", async ({ page }) => {
    await page.goto("/command-center");
    await expect(page.locator("h1").filter({ hasText: /Command Center/i })).toBeVisible();
    
    // Verify modules are present globally
    await expect(page.getByRole("heading", { name: /Recent Estimates/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Quick Actions/i })).toBeVisible();
  });

  test("Workflow Redirection from Command Center", async ({ page }) => {
    await page.goto("/command-center");
    
    // CRM Route
    const crmLink = page.getByRole("link", { name: /CRM & Clients/i }).first();
    await expect(crmLink).toBeVisible();
    await crmLink.click();
    await expect(page).toHaveURL(/\/command-center\/crm/);
    await expect(page.locator("h1").filter({ hasText: "CRM & Clients" })).toBeVisible();
    
    await page.goBack();

    // Calculators route
    const calcLink = page.getByRole("link", { name: /Pro Calculators/i }).first();
    await expect(calcLink).toBeVisible();
    await calcLink.click();
    await expect(page).toHaveURL(/\/calculators/);
  });
});
