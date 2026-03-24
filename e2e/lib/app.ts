import { expect, type Page } from "@playwright/test";
import { dismissCookieConsent } from "../utils/cookie-consent";

export async function gotoReady(
  page: Page,
  route: string,
  options?: { waitForMain?: boolean },
): Promise<void> {
  await page.goto(route, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });

  await dismissCookieConsent(page);

  if (options?.waitForMain !== false) {
    await expect(page.locator("main, [role='main']").first()).toBeVisible();
  } else {
    await expect(page.locator("body")).toBeVisible();
  }
}

export async function expectNoAppCrash(page: Page): Promise<void> {
  await expect(page.getByText(/application error|unhandled exception/i)).not.toBeVisible();
  await expect(page.locator("main")).not.toContainText(/NaN|Infinity|undefined/);
}

export async function expectCalculatorShell(page: Page): Promise<void> {
  await expect(page.locator("[aria-label='Calculator inputs']")).toBeVisible();
  await expect(page.locator("[aria-label='Calculator results']")).toBeVisible();
  await expect(page.locator(".result-counter").first()).toBeVisible();
}

export async function touchVisibleNumberInputs(
  page: Page,
  values: string[] = ["12", "10", "4"],
): Promise<void> {
  const inputs = page.locator("input[type='number']").filter({ visible: true });
  const count = await inputs.count();

  for (let index = 0; index < Math.min(count, values.length); index += 1) {
    await inputs.nth(index).fill(values[index]);
  }
}
