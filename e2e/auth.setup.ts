import fs from "node:fs/promises";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

async function writeEmptyStorageState() {
  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await fs.writeFile(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  );
}

setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    await writeEmptyStorageState();
    return;
  }

  await page.goto("/sign-in");

  // Clerk embedded flow: email → Continue → password → Continue
  const emailInput = page
    .locator('input[type="email"], input[name="identifier"]')
    .first();
  await emailInput.waitFor({ state: "visible", timeout: 30_000 });
  await emailInput.fill(email);

  await page.getByRole("button", { name: /^continue$/i }).click();

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.waitFor({ state: "visible", timeout: 15_000 });
  await passwordInput.fill(password);

  await page.getByRole("button", { name: /continue|sign in/i }).click();

  await page.waitForURL(
    /\/(command-center|calculators|saved|cart|settings)/,
    { timeout: 60_000 },
  );
  await expect(page).not.toHaveURL(/\/sign-in/);

  await page.context().storageState({ path: authFile });
});
