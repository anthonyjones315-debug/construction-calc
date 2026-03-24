import fs from "node:fs/promises";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";

const authFile = "e2e/.auth/user.json";

setup.describe.configure({ mode: 'serial' });

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

setup("authenticate", async ({ page, context }) => {
  setup.setTimeout(60_000);
  
  // Use explicitly provided credentials or fallback to env vars
  const email = process.env.PLAYWRIGHT_E2E_USER_EMAIL || process.env.TEST_USER_EMAIL || "test@proconstructioncalc.com";
  const password = process.env.PLAYWRIGHT_E2E_USER_PASSWORD || process.env.TEST_USER_PASSWORD || "Playwright315!";

  if (!email || !password) {
    console.warn("No credentials provided, writing empty auth state.");
    await writeEmptyStorageState();
    return;
  }

  // Inject testing token to bypass bot protection
  await setupClerkTestingToken({ page });

  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });

  // Playwright best practice: interact with cookie consent banner before evaluating logic
  const acceptCookiesBtn = page.getByRole('button', { name: 'Accept', exact: true });
  try {
    await acceptCookiesBtn.waitFor({ state: 'visible', timeout: 3000 });
    await acceptCookiesBtn.click();
  } catch (e) {
    // Banner might not appear
  }

  await page.locator("input[name='identifier']").fill(email);
  await page.locator("input[name='password']").fill(password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  const organizationSetupHeading = page.getByRole("heading", {
    name: /setup your organization/i,
  });
  if (await organizationSetupHeading.isVisible().catch(() => false)) {
    const organizationName = page.getByRole("textbox", { name: "Name" });
    const organizationSlug = page.getByRole("textbox", { name: "Slug" });
    const uniqueSuffix = Date.now().toString();
    await organizationName.fill(`Playwright Test Org ${uniqueSuffix}`);
    await organizationSlug.fill(`playwright-${uniqueSuffix}`);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }

  const pageContext = await page.context();
  await expect
    .poll(async () => {
      const cookies = await pageContext.cookies();
      return cookies.some((cookie) => cookie.name === "__session");
    })
    .toBe(true);

  await expect(page).not.toHaveURL(/\/sign-in(\/tasks\/choose-organization)?/, {
    timeout: 60_000,
  });

  // store the cookies in the state.json
  await pageContext.storageState({ path: authFile });
});
