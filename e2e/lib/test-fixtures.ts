/**
 * Custom Playwright test fixture that auto-blocks third-party overlays
 * (Termly cookie consent, AudioEye a11y widget) for ALL tests.
 *
 * Import { test, expect } from this file instead of '@playwright/test'
 * to get automatic overlay blocking.
 */
import { test as base, expect, devices, request } from "@playwright/test";
import type { Page, Browser, BrowserContext } from "@playwright/test";

export { expect, devices, request };
export type { Page, Browser, BrowserContext };

export const test = base.extend({
  page: async ({ page }, use) => {
    // Block Termly cookie consent and AudioEye a11y widget scripts
    // before any navigation occurs
    await page.route(
      /termly\.io|audioeye\.com|cdn\.audioeye\.com/,
      (route) => route.abort(),
    );

    await use(page);
  },
});

