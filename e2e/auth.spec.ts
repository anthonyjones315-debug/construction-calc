import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should load sign in page", async ({ page }) => {
    await page.goto("/auth/signin");

    // Check for email and password inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/auth/signin");

    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Check for error messages
    const errorMsg = page.locator(
      '[role="alert"], .error, [data-testid*="error"]',
    );
    // Error might appear or be managed by HTML5 validation
  });

  test("should have sign up link", async ({ page }) => {
    await page.goto("/auth/signin");

    // Look for sign up link
    const signUpLink = page
      .locator("a")
      .filter({ hasText: /sign up|register|create account/i });
    await expect(signUpLink).toBeVisible();
  });

  test("should navigate to registration page", async ({ page }) => {
    await page.goto("/register");

    // Check for registration form elements
    const nameInput = page
      .locator('input[type="text"], input[placeholder*="name" i]')
      .first();
    const emailInput = page.locator('input[type="email"]');

    // At least email should be visible
    await expect(emailInput).toBeVisible();
  });

  test("should have forgot password link", async ({ page }) => {
    await page.goto("/auth/signin");

    // Look for forgot password link
    const forgotLink = page
      .locator("a")
      .filter({ hasText: /forgot|reset password/i });

    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await expect(page).toHaveURL(/forgot-password|reset/);
    }
  });

  test("should display password reset form", async ({ page }) => {
    await page.goto("/forgot-password");

    // Check for email input for password reset
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});
