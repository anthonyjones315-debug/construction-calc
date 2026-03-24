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

  // Go to root to ensure the application loads and Clerk is injected into window
  await page.goto("/");

  // Playwright best practice: interact with cookie consent banner before evaluating logic
  const acceptCookiesBtn = page.getByRole('button', { name: 'Accept', exact: true });
  try {
    await acceptCookiesBtn.waitFor({ state: 'visible', timeout: 3000 });
    await acceptCookiesBtn.click();
  } catch (e) {
    // Banner might not appear
  }

  // Wait for some basic element to ensure React/Clerk starts mounting
  await page.waitForLoadState('domcontentloaded');

  const data = {
    loginPayload: {
      strategy: 'password',
      identifier: email,
      password: password,
    }
  };

  const result = await page.evaluate(async (data) => {
    // wait function as promise
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const wdw = window as Window & typeof globalThis & { Clerk: any };

    const clerkIsReady = (windowObj: any) => {
      // In newer Clerk versions it might be `.loaded` or `.isReady()`
      return windowObj.Clerk && (windowObj.Clerk.loaded || typeof windowObj.Clerk.isReady === 'function');
    };

    // wait for clerk
    let attempts = 0;
    while (!clerkIsReady(wdw) && attempts < 100) {
      await wait(100);
      attempts++;
    }

    if (!clerkIsReady(wdw)) {
      return { success: false, reason: "Clerk not loaded after 100 attempts" };
    }

    // if the session is still valid
    if (wdw.Clerk.session?.expireAt && wdw.Clerk.session.expireAt > new Date()) {
      return { success: true };
    }

    // if someone else is logged in, sign out
    if (wdw.Clerk.user) {
      await wdw.Clerk.signOut();
    }

    // otherwise signin
    try {
      const res = await wdw.Clerk.client?.signIn.create(data.loginPayload);
      if (!res) {
        return { success: false, reason: "signIn.create returned null/undefined" };
      }
      
      // set the session as active
      await wdw.Clerk.setActive({
        session: res.createdSessionId,
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, reason: "Error in signIn.create or setActive", errorDetail: e?.errors?.[0]?.message || e?.message || String(e) };
    }
  }, data);

  if (!result.success) {
    throw new Error(`Failed to sign in via evaluate bypass script: ${result.reason} | Detail: ${result.errorDetail || ''}`);
  }

  const pageContext = await page.context();
  let cookies = await pageContext.cookies();
  let retries = 0;

  // clerk polls the session cookie, so we have to set a wait
  while (!cookies.some(c => c.name === '__session') && retries < 100) {
    await page.waitForTimeout(100);
    cookies = await pageContext.cookies();
    retries++;
  }

  if (!cookies.some(c => c.name === '__session')) {
    throw new Error('Failed to find __session cookie after sign in');
  }

  // Check the URL manually or wait
  // No need to click anything or wait for URL match, but let's wait a moment just to ensure storage state is fully stable
  await page.waitForTimeout(1000);

  // store the cookies in the state.json
  await pageContext.storageState({ path: authFile });
});
