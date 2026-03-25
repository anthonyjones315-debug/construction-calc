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

  // Clerk may show a two-step flow: identifier → password
  const continueBtn = page.getByRole("button", { name: "Continue", exact: true });
  await continueBtn.click();

  // Wait for the password field (Clerk might transition between steps)
  const passwordInput = page.locator("input[name='password']");
  await passwordInput.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
  if (await passwordInput.isVisible()) {
    await passwordInput.fill(password);
    await continueBtn.click();
  }

  // ── Handle Clerk organization tasks ──
  // Clerk might redirect to /sign-in/tasks/choose-organization or show an org setup screen.
  // Wait up to 15s for the page to settle after login.
  await page.waitForTimeout(3000);

  const currentUrl = page.url();

  // Case 1: Choose-organization task page — click the first org in the list
  if (currentUrl.includes("choose-organization") || currentUrl.includes("/tasks/")) {
    const orgButton = page.locator(
      'button[class*="organizationPreview"], ' +
      '[data-localization-key*="organizationList"] button, ' +
      '.cl-organizationSwitcherPopoverCard button, ' +
      '.cl-organizationListItem, ' +
      'button:has-text("Personal")'
    ).first();
    try {
      await orgButton.waitFor({ state: "visible", timeout: 10_000 });
      await orgButton.click();
      await page.waitForTimeout(2000);
    } catch {
      // If no org button found, try clicking any visible "Continue" or "Skip"
      const skipBtn = page.getByRole("button", { name: /skip|continue/i }).first();
      if (await skipBtn.isVisible().catch(() => false)) {
        await skipBtn.click();
      }
    }
  }

  // Case 2: Organization setup/creation heading
  const organizationSetupHeading = page.getByRole("heading", {
    name: /setup your organization|create.*organization/i,
  });
  if (await organizationSetupHeading.isVisible().catch(() => false)) {
    const organizationName = page.getByRole("textbox", { name: "Name" });
    // Check if the field is editable (not disabled/pre-filled by Clerk)
    const isDisabled = await organizationName.isDisabled().catch(() => true);
    if (!isDisabled) {
      const organizationSlug = page.getByRole("textbox", { name: "Slug" });
      const uniqueSuffix = Date.now().toString();
      await organizationName.fill(`Playwright Test Org ${uniqueSuffix}`);
      await organizationSlug.fill(`playwright-${uniqueSuffix}`);
    }
    // Click Continue whether we filled or fields were pre-populated
    const continueOrg = page.getByRole("button", { name: /continue|create/i }).first();
    await continueOrg.click();
    await page.waitForTimeout(2000);
  }

  // ── Wait for successful auth ──
  const pageContext = await page.context();
  await expect
    .poll(async () => {
      const cookies = await pageContext.cookies();
      return cookies.some((cookie) => cookie.name === "__session");
    }, { timeout: 30_000 })
    .toBe(true);

  // Wait for redirect away from sign-in pages
  await expect(page).not.toHaveURL(/\/(sign-in|sign-up)/, {
    timeout: 30_000,
  });

  // store the cookies in the state.json
  await pageContext.storageState({ path: authFile });
});
