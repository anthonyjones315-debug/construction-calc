import { test, expect } from "@playwright/test";

test.describe("PDF Export", () => {

  test("PDF download from Finalize modal initiates without error", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Yards/i).waitFor({ state: "visible" });

    // Open finalize modal
    const finalizeBtn = page.getByRole("button", { name: /Finalize/i }).first();
    await finalizeBtn.click();
    await expect(page.getByText(/Finalize Estimate/i)).toBeVisible();

    // Click Download PDF
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Download PDF/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  test("PDF button shows loading state while generating", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Yards/i).waitFor({ state: "visible" });

    const finalizeBtn = page.getByRole("button", { name: /Finalize/i }).first();
    await finalizeBtn.click();

    const pdfBtn = page.getByRole("button", { name: /Download PDF/i });
    if (await pdfBtn.isVisible()) {
      await pdfBtn.click();
      // Button should show loading state
      await expect(
        page.getByRole("button", { name: /Generating/i })
      ).toBeVisible({ timeout: 2000 });
    }
  });

  test("PDF generation doesn't lock the page indefinitely", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Yards/i).waitFor({ state: "visible" });

    const finalizeBtn = page.getByRole("button", { name: /Finalize/i }).first();
    await finalizeBtn.click();

    const pdfBtn = page.getByRole("button", { name: /Download PDF/i });
    if (await pdfBtn.isVisible()) {
      await pdfBtn.click();
      // Button should return to normal state within 15 seconds
      await expect(pdfBtn).not.toBeDisabled({ timeout: 15_000 });
    }
  });

  test("PDF filename is meaningful, not generic", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByText(/Total Yards/i).waitFor({ state: "visible" });

    const finalizeBtn = page.getByRole("button", { name: /Finalize/i }).first();
    await finalizeBtn.click();

    const pdfBtn = page.getByRole("button", { name: /Download PDF/i });
    if (await pdfBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfBtn.click(),
      ]);
      // Filename should contain something meaningful, not "download.pdf"
      expect(download.suggestedFilename()).not.toBe("download.pdf");
    }
  });

});
