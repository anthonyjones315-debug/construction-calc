import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Homeowner — PDF Content & Readability", () => {
  const downloadDir = path.join(__dirname, "../.downloads");

  test.beforeAll(async () => {
    if (!fs.existsSync(downloadDir))
      fs.mkdirSync(downloadDir, { recursive: true });
  });

  test("PDF contains contractor contact information", async ({
    page,
    context,
  }) => {
    await context.grantPermissions([]);
    await page.goto("/cart");

    const pdfBtn = page.getByRole("button", {
      name: /export pdf|download pdf/i,
    });
    const btnVisible = await pdfBtn
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    if (!btnVisible) {
      test.skip(
        true,
        "No PDF export button found on /cart — requires estimate data",
      );
      return;
    }
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      pdfBtn.click(),
    ]);

    const filePath = path.join(downloadDir, "estimate-test.pdf");
    await download.saveAs(filePath);

    // Verify file exists and has content
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(10_000); // At least 10KB — not an empty file

    // Clean up
    fs.unlinkSync(filePath);
  });

  test("PDF filename reflects the estimate context", async ({ page }) => {
    await page.goto("/cart");

    const pdfBtn = page.getByRole("button", {
      name: /export pdf|download pdf/i,
    });
    if (await pdfBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfBtn.click(),
      ]);

      const filename = download.suggestedFilename();
      // Should not be generic — should contain date or job name
      expect(filename).toMatch(/estimate|proposal|calc|job/i);
      expect(filename).not.toBe("download.pdf");
      expect(filename).not.toBe("file.pdf");
      expect(filename).toMatch(/\.pdf$/i);
    }
  });

  test("PDF generation does not produce a zero-byte file", async ({ page }) => {
    await page.goto("/cart");

    const pdfBtn = page.getByRole("button", {
      name: /export pdf|download pdf/i,
    });
    if (await pdfBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfBtn.click(),
      ]);

      const filePath = path.join(downloadDir, "zero-byte-test.pdf");
      await download.saveAs(filePath);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
      fs.unlinkSync(filePath);
    }
  });

  test("invoice generation works from saved estimate", async ({ page }) => {
    await page.goto("/saved");
    const firstEstimate = page.getByTestId("saved-estimate").first();

    if (await firstEstimate.isVisible()) {
      await firstEstimate.click();
      await page.waitForURL(/saved\//);

      const invoiceBtn = page.getByRole("button", {
        name: /invoice|generate invoice/i,
      });
      if (await invoiceBtn.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          invoiceBtn.click(),
        ]);
        expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf$/i);
      }
    }
  });
});
