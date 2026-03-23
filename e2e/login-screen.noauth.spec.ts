import { test, expect } from "@playwright/test";

test("Clerk login modal appears", async ({ page }) => {
  await page.goto("/");
  // Wait for the page to load
  await page.waitForLoadState("networkidle");
  
  const signInButton = page.getByRole("button", { name: /sign in/i }).first();
  await expect(signInButton).toBeVisible();
  await signInButton.click();
  
  // Clerk modal often has a class like .cl-root or .cl-modalContent
  // We'll wait for the modal to appear
  const modal = page.locator(".cl-root, .cl-modalContent").first();
  await expect(modal).toBeVisible({ timeout: 10000 });
});
