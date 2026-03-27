import fs from "node:fs/promises";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";

const authFile = "e2e/.auth/user.json";

setup.describe.configure({ mode: "serial" });

// Global Clerk test-token setup
setup("global setup", async () => {
  await clerkSetup();
});

// Helper to write an empty auth state when credentials are missing
async function writeEmptyStorageState() {
  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await fs.writeFile(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  );
}

// Main authentication step
setup("authenticate", async ({ page }) => {
  setup.setTimeout(120_000);

  const email =
    process.env.PLAYWRIGHT_E2E_USER_EMAIL ||
    process.env.TEST_USER_EMAIL ||
    "test@proconstructioncalc.com";
  const password =
    process.env.PLAYWRIGHT_E2E_USER_PASSWORD ||
    process.env.TEST_USER_PASSWORD ||
    "Playwright315!";

  if (!email || !password) {
    console.warn("No credentials provided, writing empty auth state.");
    await writeEmptyStorageState();
    return;
  }

  // Inject Clerk testing token to bypass bot protection
  await setupClerkTestingToken({ page });

  // Navigate to sign-in
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });

  // Dismiss cookie consent if present
  const acceptCookiesBtn = page.getByRole("button", { name: "Accept", exact: true });
  try {
    await acceptCookiesBtn.waitFor({ state: "visible", timeout: 3000 });
    await acceptCookiesBtn.click();
  } catch {
    // Banner might not appear
  }

  // Fill email (Clerk identifier field)
  await page.locator("input[name='identifier']").fill(email);
  const continueBtn = page.getByRole("button", { name: "Continue", exact: true });
  await continueBtn.click();

  // Wait for password field (Clerk two-step flow)
  const passwordInput = page.locator("input[name='password']");
  await passwordInput.waitFor({ state: "visible", timeout: 15_000 });
  await passwordInput.fill(password);
  await continueBtn.click();

  // Wait for redirect away from sign-in pages
  await expect(page).not.toHaveURL(/\/(sign-in|sign-up)/, {
    timeout: 30_000,
  });

  // Save authenticated storage state
  await page.context().storageState({ path: authFile });
});
