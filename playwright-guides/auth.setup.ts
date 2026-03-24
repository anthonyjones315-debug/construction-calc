import fs from "node:fs/promises";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";

const authFile = "e2e/.auth/user.json";

setup.describe.configure({ mode: "serial" });

setup("global setup", async () => {
  await clerkSetup();
});

async function writeEmptyStorageState() {
  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await fs.writeFile(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  );
}

setup("authenticate", async ({ page }) => {
  setup.setTimeout(60_000);

  const email =
    process.env.PLAYWRIGHT_E2E_USER_EMAIL ||
    process.env.TEST_USER_EMAIL ||
    "test@proconstructioncalc.com";
  const password =
    process.env.PLAYWRIGHT_E2E_USER_PASSWORD ||
    process.env.TEST_USER_PASSWORD ||
    "Playwright315!";

  if (!email || !password) {
    await writeEmptyStorageState();
    return;
  }

  await setupClerkTestingToken({ page });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const result = await page.evaluate(
    async ({ emailAddress, passwordValue }) => {
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const windowWithClerk = window as Window & typeof globalThis & {
        Clerk?: any;
      };

      let attempts = 0;
      while (!windowWithClerk.Clerk?.loaded && attempts < 100) {
        await wait(100);
        attempts += 1;
      }

      if (!windowWithClerk.Clerk?.loaded) {
        return { success: false, reason: "Clerk failed to load" };
      }

      if (windowWithClerk.Clerk.user) {
        await windowWithClerk.Clerk.signOut();
      }

      try {
        const signIn = await windowWithClerk.Clerk.client.signIn.create({
          strategy: "password",
          identifier: emailAddress,
          password: passwordValue,
        });

        await windowWithClerk.Clerk.setActive({
          session: signIn.createdSessionId,
        });

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          reason: error?.errors?.[0]?.message || error?.message || String(error),
        };
      }
    },
    { emailAddress: email, passwordValue: password },
  );

  if (!result.success) {
    throw new Error(`Guide auth setup failed: ${result.reason}`);
  }

  await expect
    .poll(async () => {
      const cookies = await page.context().cookies();
      return cookies.some((cookie) => cookie.name === "__session");
    })
    .toBe(true);

  await page.context().storageState({ path: authFile });
});
