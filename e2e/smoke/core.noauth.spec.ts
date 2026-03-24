import { expect, test } from "@playwright/test";
import { expectGuestAuthPrompt } from "../lib/app";

test.describe("@smoke core public UI", () => {
  test("@smoke home renders and links to calculators", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /calculators/i }).first(),
    ).toBeVisible();
  });

  test("@smoke calculators directory renders trade categories", async ({
    page,
  }) => {
    await page.goto("/calculators");
    for (const category of ["Concrete", "Framing", "Roofing", "Business"]) {
      await expect(
        page.getByText(new RegExp(category, "i")).first(),
      ).toBeVisible();
    }
  });

  test("@smoke concrete slab calculator loads with editable input", async ({
    page,
  }) => {
    await page.goto("/calculators/concrete/slab", {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await expect(page.getByRole("heading", { name: /slab/i })).toBeVisible({
      timeout: 90_000,
    });
    const lengthInput = page.getByLabel(/length|run length/i).first();
    await expect(lengthInput).toBeVisible({ timeout: 90_000 });
    await lengthInput.fill("24");
    await expect(lengthInput).toHaveValue("24");
  });

  test("@smoke 404 route renders not found UI", async ({ page }) => {
    await page.goto("/calculators/fake-category/nonexistent-calc");
    await expect(
      page.getByRole("heading", { name: /page not found/i }),
    ).toBeVisible();
  });

  test("@smoke auth pages load", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/sign-in/);

    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe("@smoke auth guards", () => {
  test("@smoke guest is redirected from protected routes", async ({ page }) => {
    for (const path of [
      "/saved",
      "/settings",
      "/command-center",
      "/pricebook",
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expectGuestAuthPrompt(page);
    }
  });
});
