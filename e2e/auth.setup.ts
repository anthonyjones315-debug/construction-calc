import fs from "node:fs/promises";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { clerk, clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";

setup.describe.configure({ mode: 'serial' });

setup("clerk setup", async () => {
  await clerkSetup();
});

const authFile = "e2e/.auth/user.json";

async function writeEmptyStorageState() {
  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await fs.writeFile(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  );
}

setup("authenticate", async ({ page }) => {
  setup.setTimeout(60000);
  const email = process.env.TEST_USER_EMAIL;
  // Note: Clerk testing handles the session, but we still want to save storage state
  // for tests that don't use Clerk testing helpers directly.
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    await writeEmptyStorageState();
    return;
  }

  await setupClerkTestingToken({ page });

  await page.goto("/"); // Needs to be on the same domain for cookies

  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password: password,
    },
  });

  await page.goto("/command-center"); // Or any protected route to verify

  await page.waitForURL(
    /\/(command-center|calculators|saved|cart|settings)/,
    { timeout: 60_000 },
  );
  await expect(page).not.toHaveURL(/\/sign-in/);

  await page.context().storageState({ path: authFile });
});
