import { test as setup } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { handleUnexpectedModals } from "./utils/smartNav";

/**
 * Global setup file runs before *every* test.
 * Used to inject Clerk testing tokens to bypass bot protection,
 * and proactively clear any stray popups (e.g. AudioEye, Termly)
 * before the test even starts.
 */
setup.beforeEach(async ({ page }) => {
  // Inject the bypass token so we don't hit Cloudflare challenges
  await setupClerkTestingToken({ page }).catch(() => {
    console.warn("Could not inject Clerk testing token — is CLERK_SECRET_KEY set?");
  });

  // Small delay to let initial scripts load, then clear modals
  await page.waitForTimeout(500);
  await handleUnexpectedModals(page);
});
