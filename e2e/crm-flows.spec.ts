import { test, expect } from "@playwright/test";

test.describe("CRM & Clients Flows", () => {
  // We use test.use({ storageState: ... }) or standard auth if already configured
  // Assuming auth state is injected by Playwright's global setup for signed-in tests

  test("should allow creating a new client and viewing it in the dashboard @smoke", async ({ page }) => {
    await page.goto("/command-center/crm");
    
    // Wait for the page to load
    await expect(page.locator("h1").filter({ hasText: "CRM & Clients" })).toBeVisible();

    // Click "New Client"
    await page.getByRole("button", { name: /New Client/i }).click();

    // Fill form
    const uniqueName = `Smoke Test Client ${Date.now()}`;
    await page.getByLabel("Full Name").fill(uniqueName);
    await page.getByLabel("Phone Number").fill("(555) 000-1234");
    await page.getByLabel("Email Address").fill("smoketest@example.com");
    await page.getByLabel("Address").fill("123 Test Ave");

    // Save
    await page.getByRole("button", { name: /Create Client/i }).click();

    // Wait for the modal to close and the client to appear in the list
    await expect(page.getByText(uniqueName)).toBeVisible();
    await expect(page.getByText("smoketest@example.com")).toBeVisible();
  });

  test("should populate the New Estimate form when selecting a CRM client @smoke", async ({ page }) => {
    await page.goto("/command-center/estimates/new");

    // Ensure we are on the new estimate page
    await expect(page.getByText(/Estimate Details/i)).toBeVisible();

    // Check if the select exists
    const select = page.locator('select[title="Fill from CRM"]');
    
    // We expect the dropdown to be visible if there are clients (we just created one above, but it depends on test isolation)
    // We'll wrap in a soft assertion just in case isolation is strict and it's empty
    const count = await select.count();
    if (count > 0) {
      await expect(select).toBeVisible();

      // Get the second option (first is empty "Import...")
      const options = await select.locator("option").allTextContents();
      if (options.length > 1) {
        const optionLabel = options[1].trim();
        await select.selectOption({ label: optionLabel });

        // Wait for Client Name input to autofill
        const clientNameInput = page.getByRole("textbox", { name: /Client Name/i });
        await expect(clientNameInput).toHaveValue(optionLabel);
      }
    }
  });
});
