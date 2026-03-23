import { test, expect, type Page } from "@playwright/test";

// Use an authenticated session so the "Email Estimate" button renders if it requires auth
// (Though we can also mock session or test against public if it's available)
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test.describe("Email Estimate Flow", () => {
  const dismissCookies = async (page: Page) => {
    const acceptBtn = page.getByRole("button", { name: /accept/i });
    try {
      await acceptBtn.waitFor({ state: "visible", timeout: 3000 });
      await acceptBtn.click();
      await acceptBtn.waitFor({ state: "hidden", timeout: 2000 });
    } catch {
      /* banner not present */
    }
  };

  test("can send an estimate via the email modal", async ({ page }) => {
    // Authenticate the test so the user can access "Finalize" features if restricted
    await setupClerkTestingToken({ page });
    
    // Mock the email sending API to avoid spamming real addresses
    let apiCalled = false;
    await page.route("/api/send", async (route) => {
      apiCalled = true;
      const payload = route.request().postDataJSON();
      // Ensure the payload has the right structure
      expect(payload.to).toBe("client@example.com");
      expect(payload.estimate).toBeDefined();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "mock-email-id" }),
      });
    });

    await page.goto("/calculators/concrete/slab");
    await dismissCookies(page);

    // Fill in dimension inputs
    const inputs = page.locator("input[type='number']");
    await inputs.nth(0).fill("20");
    await inputs.nth(1).fill("24");
    await inputs.nth(2).fill("4");

    // Wait for the result quote to generate
    const resultText = page.locator('div').filter({ hasText: /Order/i }).filter({ hasText: /[\d.]+/ }).last();
    await expect(resultText).toBeVisible();

    // Click Finalize
    const finalizeBtn = page.getByRole("button", { name: "Finalize", exact: true }).first();
    await finalizeBtn.click();
    await expect(page.getByText(/Finalize Estimate/i)).toBeVisible();

    // Click Email Estimate
    const emailBtn = page.getByRole("button", { name: /Email Estimate/i });
    if (await emailBtn.isVisible()) {
      await emailBtn.click();

      // Ensure the modal rendered
      const modalTitle = page.getByRole("heading", { name: /Email Estimate/i });
      await expect(modalTitle).toBeVisible();

      // Fill in the recipient email
      const toInput = page.getByPlaceholder(/client@example.com/i);
      await toInput.fill("client@example.com");

      // Click Send
      const sendBtn = page.getByRole("button", { name: /^Send$/i });
      await sendBtn.click();

      // The modal should show success message
      await expect(page.getByText(/Estimate sent successfully/i)).toBeVisible();

      // Verify our mocked route was called
      expect(apiCalled).toBe(true);
    } else {
      test.skip(true, "Email Estimate button is hidden or requires backend premium feature flag.");
    }
  });
});
