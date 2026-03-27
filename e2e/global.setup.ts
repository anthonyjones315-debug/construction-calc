import { test as setup } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { handleUnexpectedModals } from "./utils/smartNav";

/**
 * Global setup file runs before *every* test.
 * Used to inject Clerk testing tokens to bypass bot protection,
 * block third-party overlays (Termly, AudioEye), and
 * proactively clear any stray popups before the test starts.
 */
setup.beforeEach(async ({ page }) => {
  // Block Termly cookie consent and AudioEye a11y widget scripts
  // This prevents the overlays from ever appearing
  await page.route(/termly\.io|audioeye\.com|cdn\.audioeye\.com/, (route) => route.abort());

  // Inject the bypass token so we don't hit Cloudflare challenges
  await setupClerkTestingToken({ page }).catch(() => {
    console.warn("Could not inject Clerk testing token — is CLERK_SECRET_KEY set?");
  });

  // Small delay to let initial scripts load, then clear modals
  await page.waitForTimeout(500);
  await handleUnexpectedModals(page);
});
