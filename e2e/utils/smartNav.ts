import type { Page, Locator } from "@playwright/test";

/**
 * Smart Navigation & Exception Handling Utilities
 *
 * These utilities make E2E tests resilient against:
 * - Network latency and slow Next.js SSR renders
 * - Unexpected UI modals, toasts, and overlays blocking interactions
 * - Flaky click-interception from loading spinners
 */

/* ── Safe Navigation ──────────────────────────────────────────── */

/**
 * Navigate to a URL with automatic retry on timeout.
 * Uses `domcontentloaded` for speed since we use web-first assertions
 * to wait for actual elements afterward.
 */
export async function safeNavigate(
  page: Page,
  url: string,
  options?: { timeout?: number },
) {
  const timeout = options?.timeout ?? 45_000;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });
  } catch (error) {
    // On timeout / network error — reload once and retry
    console.warn(
      `[smartNav] Initial navigation to ${url} failed, retrying...`,
    );
    try {
      await page.reload({ waitUntil: "domcontentloaded", timeout });
    } catch {
      // If reload also fails, try goto one more time
      await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    }
  }
}

/* ── Unexpected Modal / Toast Dismissal ───────────────────────── */

/** Common UI blockers to auto-dismiss before proceeding. */
const DISMISS_SELECTORS = [
  // Generic close buttons (toasts, modals)
  { locator: 'button:has-text("Close")', label: "Close button" },
  { locator: 'button:has-text("Dismiss")', label: "Dismiss button" },
  { locator: 'button:has-text("Got it")', label: "Got it button" },
  { locator: '[aria-label="Close"]', label: "Aria-close button" },
  // Cookie consent / welcome banners
  { locator: 'button:has-text("Accept")', label: "Accept button" },
  { locator: 'button:has-text("Accept all")', label: "Accept all button" },
  // Sentry feedback widget
  { locator: "#sentry-feedback button", label: "Sentry feedback" },
] as const;

/**
 * Scan for common blocking UI elements and dismiss them.
 * This is safe to call at any point — it only clicks elements that are
 * actually visible and in the viewport.
 */
export async function handleUnexpectedModals(page: Page) {
  for (const { locator: sel, label } of DISMISS_SELECTORS) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 })) {
        console.warn(`[smartNav] Dismissing unexpected UI: ${label}`);
        await el.click({ timeout: 2_000 });
        // Small pause for dismiss animation
        await page.waitForTimeout(300);
      }
    } catch {
      // Element not found or not interactable — ignore
    }
  }
}

/* ── Safe Click with Fallback ─────────────────────────────────── */

/**
 * Attempt to click a locator. If the click is intercepted (e.g. by a
 * loading overlay), wait for network idle, dismiss any blocking modals,
 * and retry one more time.
 */
export async function safeClick(
  page: Page,
  locator: Locator,
  options?: { timeout?: number },
) {
  const timeout = options?.timeout ?? 10_000;

  try {
    await locator.click({ timeout });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isIntercept =
      message.includes("intercept") || message.includes("obscured");

    if (!isIntercept) throw error;

    console.warn(
      "[smartNav] Click intercepted — waiting for network idle and dismissing modals...",
    );

    // Wait for in-flight requests to settle
    await page
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => {});

    // Clear any blocking UI
    await handleUnexpectedModals(page);

    // Retry the click
    await locator.click({ timeout });
  }
}

/* ── Convenience: Wait for Hydration ──────────────────────────── */

/**
 * Wait for the Next.js app to fully hydrate.
 * Useful when you need to ensure client-side interactivity after SSR.
 */
export async function waitForHydration(page: Page) {
  // Wait for any next.js hydration indicator — <body> or __next container
  await page.waitForFunction(
    () => document.querySelector("#__next") !== null || document.readyState === "complete",
    { timeout: 30_000 },
  );
}
