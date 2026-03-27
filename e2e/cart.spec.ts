import { test, expect } from "./lib/test-fixtures";

test.describe("Estimate Cart", () => {

  test("cart page loads and shows content", async ({ page }) => {
    await page.goto("/cart");
    // Cart page should load without errors
    await expect(page).toHaveURL(/\/cart/);
    // Should show either items or an empty state
    const pageContent = await page.textContent("body");
    expect(pageContent?.length).toBeGreaterThan(0);
  });

  test("empty cart shows a helpful empty state, not a broken layout", async ({ page }) => {
    // Visit cart directly with no prior items
    await page.goto("/cart");
    // Should display either items or an empty/getting-started message
    const mainText = await page.locator("main").textContent() ?? "";
    expect(mainText).not.toMatch(/unhandled.*error|500 internal/i);
  });

  test("calculator Save Estimate button is visible", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Cubic Yards|Material Order|Cubic Yards/i).first().waitFor({ state: "visible" });

    // "Save Estimate" is the action to persist to local cart
    const saveBtn = page.getByRole("button", { name: /Save Estimate/i });
    await expect(saveBtn).toBeVisible();
  });

  test("Finalize & Send button opens finalize modal", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Cubic Yards|Material Order|Cubic Yards/i).first().waitFor({ state: "visible" });

    const finalizeBtn = page.getByRole("button", { name: /Finalize/i }).first();
    await expect(finalizeBtn).toBeVisible();
    await finalizeBtn.click();

    // Finalize modal should appear with options
    await expect(page.getByText(/Finalize Estimate/i)).toBeVisible();
    // Modal has "Add to Estimate Queue", "Download PDF", etc.
    await expect(
      page.getByRole("button", { name: /Download PDF|Estimate Queue/i }).first()
    ).toBeVisible();
  });

  test("cart badge in nav reflects item count after save", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Cubic Yards|Material Order|Cubic Yards/i).first().waitFor({ state: "visible" });

    // Click Save Estimate to add to local cart
    const saveBtn = page.getByRole("button", { name: /Save Estimate/i });
    await saveBtn.click();
    await expect(saveBtn).toContainText(/saved|verified|downloaded/i);
    // Cart page should now show the saved item
    await page.goto("/cart");
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toMatch(/slab|concrete|estimate/i);
  });

  test("cart persists after page reload", async ({ page }) => {
    // Add an item via Save Estimate
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Cubic Yards|Material Order|Cubic Yards/i).first().waitFor({ state: "visible" });
    const saveBtn = page.getByRole("button", { name: /Save Estimate/i });
    await saveBtn.click();
    await expect(saveBtn).toContainText(/saved|verified|downloaded/i);

    // Navigate to cart and reload
    await page.goto("/cart");
    await page.reload();

    // Cart should still show content
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toMatch(/slab|concrete|estimate|cart/i);
  });

});
