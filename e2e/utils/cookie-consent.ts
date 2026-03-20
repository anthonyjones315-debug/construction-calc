import type { Page } from "@playwright/test";

export async function dismissCookieConsent(page: Page): Promise<void> {
  const candidates = [
    page.getByRole("button", { name: /accept|agree|allow all|ok/i }).first(),
    page.getByRole("button", { name: /close|dismiss/i }).first(),
    page.locator("#termly-consent-banner button").first(),
    page.locator("button.tm-btn, button[class*='termly']").first(),
  ];

  for (const candidate of candidates) {
    try {
      if (await candidate.isVisible({ timeout: 500 })) {
        await candidate.click({ timeout: 1000 });
        break;
      }
    } catch {
      // Ignore missing/hidden consent controls for pages without banners
    }
  }
}
