import { test, expect } from "./lib/test-fixtures";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { safeNavigate, safeClick, handleUnexpectedModals } from "./utils/smartNav";

test.describe("CRM & Clients Flows", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test("should allow creating a new client and viewing it in the dashboard @smoke", async ({ page }) => {
    await safeNavigate(page, "/command-center/crm");
    if (/\/sign-in/.test(page.url())) {
      test.skip(true, "Auth session not available for CRM");
    }
    await handleUnexpectedModals(page);
    await expect(page.getByRole("heading", { name: /CRM/i })).toBeVisible();

    await safeClick(page, page.getByRole("button", { name: /New Client/i }));

    const uniqueName = `Smoke Test Client ${Date.now()}`;
    await page.getByLabel(/Full Name/i).fill(uniqueName);
    await page.getByLabel(/Phone Number/i).fill("(555) 000-1234");
    await page.getByLabel(/Email Address/i).fill("smoketest@example.com");
    await page.getByLabel(/Address/i).fill("123 Test Ave");

    await safeClick(page, page.getByRole("button", { name: /Create Client/i }));

    await expect(page.getByText(uniqueName)).toBeVisible();
    await expect(page.getByText("smoketest@example.com")).toBeVisible();
  });

  test("should allow editing an existing client", async ({ page }) => {
    await safeNavigate(page, "/command-center/crm");
    if (/\/sign-in/.test(page.url())) {
      test.skip(true, "Auth session not available for CRM");
    }
    await handleUnexpectedModals(page);
    await expect(page.getByRole("heading", { name: /CRM/i })).toBeVisible();

    // Create one first to ensure we have one to edit independently
    await safeClick(page, page.getByRole("button", { name: /New Client/i }));
    const uniqueName = `Edit Target ${Date.now()}`;
    await page.getByLabel(/Full Name/i).fill(uniqueName);
    await safeClick(page, page.getByRole("button", { name: /Create Client/i }));
    await expect(page.getByText(uniqueName)).toBeVisible();

    // Click the action/more button on the client card using role-based locator
    const clientCard = page.getByText(uniqueName).locator("../..");
    const moreButton = clientCard.getByRole("button").first();
    await safeClick(page, moreButton);

    // The modal should open with "Edit Client"
    await expect(page.getByRole("heading", { name: /Edit Client/i })).toBeVisible();
    await page.getByLabel(/Phone Number/i).fill("(999) 888-7777");
    await safeClick(page, page.getByRole("button", { name: /Save Changes/i }));

    // Assert the card updated
    await expect(page.getByText("(999) 888-7777")).toBeVisible();
  });

  test("should handle empty search gracefully", async ({ page }) => {
    await safeNavigate(page, "/command-center/crm");
    await handleUnexpectedModals(page);
    await expect(page.getByRole("heading", { name: /CRM/i })).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search clients/i);
    await searchInput.fill("NON EXISTENT CLIENT XYZ 123");

    await expect(page.getByRole("heading", { name: /No clients found/i })).toBeVisible();
    await expect(page.getByText(/Try a different search term/i)).toBeVisible();
  });

  test("should populate the New Estimate form when selecting a CRM client @smoke", async ({ page }) => {
    await safeNavigate(page, "/command-center/estimates/new");
    await handleUnexpectedModals(page);
    await expect(page.getByText(/Estimate Details/i)).toBeVisible();

    const select = page.locator('select[title="Fill from CRM"]');

    // Verify dynamic injection handles clients mapped to storageState
    const count = await select.count();
    if (count > 0) {
      await expect(select).toBeVisible();
      const options = await select.locator("option").allTextContents();
      if (options.length > 1) {
        const optionLabel = options[1].trim();
        await select.selectOption({ label: optionLabel });

        const clientNameInput = page.getByRole("textbox", { name: /Client Name/i });
        await expect(clientNameInput).toHaveValue(optionLabel);
      }
    }
  });
});
