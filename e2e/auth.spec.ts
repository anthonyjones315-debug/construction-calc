import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {

  test.describe("Sign In", () => {
    test("contractor can sign in with valid credentials", async ({ page }) => {
      await page.goto("/auth/signin");
      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByLabel("Password").fill("TestPass123!");
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page).not.toHaveURL(/auth\/signin/);
      await expect(page.getByText(/welcome|dashboard|calculators/i)).toBeVisible();
    });

    test("shows inline error for wrong password — not a full page crash", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByLabel("Password").fill("WrongPassword!");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should stay on sign-in page with an error message
      await expect(page).toHaveURL(/auth\/signin/);
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(page.getByRole("alert")).toContainText(/invalid|incorrect|credentials/i);
    });

    test("blocks sign in for completely unknown email", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill("nobody@nowhere.fake");
      await page.getByLabel("Password").fill("SomePass123!");
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page).toHaveURL(/auth\/signin/);
      await expect(page.getByRole("alert")).toBeVisible();
    });

    test("sign in button is disabled while submitting", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByLabel("Password").fill("TestPass123!");

      const submitBtn = page.getByRole("button", { name: /sign in/i });
      await submitBtn.click();

      // Button should be disabled immediately after click (prevents double-submit)
      await expect(submitBtn).toBeDisabled();
    });

    test("'forgot password' link is visible and navigates correctly", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByRole("link", { name: /forgot password/i }).click();
      await expect(page).toHaveURL(/forgot-password/);
    });
  });

  test.describe("Registration", () => {
    test("new contractor can register with valid details", async ({ page }) => {
      const uniqueEmail = `test-${Date.now()}@contractor.test`;

      await page.goto("/register");
      await page.getByLabel("Email").fill(uniqueEmail);
      await page.getByLabel(/password/i).first().fill("SecurePass123!");
      await page.getByLabel(/confirm password/i).fill("SecurePass123!");
      await page.getByRole("button", { name: /register|create account/i }).click();

      // Should redirect to onboarding or verification step
      await expect(page).not.toHaveURL(/register/);
    });

    test("shows error when passwords don't match", async ({ page }) => {
      await page.goto("/register");
      await page.getByLabel("Email").fill("test@test.com");
      await page.getByLabel(/password/i).first().fill("Password123!");
      await page.getByLabel(/confirm password/i).fill("DifferentPass123!");
      await page.getByRole("button", { name: /register|create account/i }).click();

      await expect(page.getByText(/passwords.*match|do not match/i)).toBeVisible();
      await expect(page).toHaveURL(/register/);
    });

    test("validates email format before submit", async ({ page }) => {
      await page.goto("/register");
      await page.getByLabel("Email").fill("notanemail");
      await page.getByLabel(/password/i).first().fill("Password123!");
      await page.getByRole("button", { name: /register|create account/i }).click();

      // Native or custom email validation
      const emailInput = page.getByLabel("Email");
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );
      expect(validationMessage.length).toBeGreaterThan(0);
    });
  });

  test.describe("Two-Factor Authentication", () => {
    test("2FA prompt appears after correct password when enabled", async ({ page }) => {
      // Assumes a test account with 2FA pre-enabled
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(process.env.TEST_2FA_EMAIL!);
      await page.getByLabel("Password").fill(process.env.TEST_2FA_PASSWORD!);
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page.getByText(/verification code|6-digit|OTP/i)).toBeVisible();
    });

    test("wrong OTP shows error and doesn't advance session", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(process.env.TEST_2FA_EMAIL!);
      await page.getByLabel("Password").fill(process.env.TEST_2FA_PASSWORD!);
      await page.getByRole("button", { name: /sign in/i }).click();

      await page.getByLabel(/code|OTP/i).fill("000000");
      await page.getByRole("button", { name: /verify|confirm/i }).click();

      await expect(page.getByRole("alert")).toContainText(/invalid|incorrect|expired/i);
    });

    test("OTP field only accepts 6 digits", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(process.env.TEST_2FA_EMAIL!);
      await page.getByLabel("Password").fill(process.env.TEST_2FA_PASSWORD!);
      await page.getByRole("button", { name: /sign in/i }).click();

      const otpField = page.getByLabel(/code|OTP/i);
      await otpField.fill("12345678"); // 8 digits
      const value = await otpField.inputValue();
      expect(value.length).toBeLessThanOrEqual(6);
    });
  });

  test.describe("Password Reset", () => {
    test("reset flow sends email confirmation message", async ({ page }) => {
      await page.goto("/forgot-password");
      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByRole("button", { name: /send|reset/i }).click();

      await expect(page.getByText(/email sent|check your inbox/i)).toBeVisible();
    });

    test("reset page rejects weak new password", async ({ page }) => {
      // Simulate landing on reset page with a token
      await page.goto("/reset-password?token=fake-token-for-ui-test");
      await page.getByLabel(/new password/i).fill("weak");
      await page.getByRole("button", { name: /reset|update/i }).click();

      await expect(page.getByText(/too short|minimum|8 characters/i)).toBeVisible();
    });
  });

});
