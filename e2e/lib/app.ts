import { expect, type Locator, type Page } from "@playwright/test";
import { dismissCookieConsent } from "../utils/cookie-consent";

async function dismissBlockingDialog(page: Page): Promise<void> {
  const closeButton = page
    .getByRole("dialog")
    .getByRole("button", { name: /close|dismiss|skip/i })
    .first();

  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click({ force: true }).catch(() => {});
  }
}

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
  await dismissBlockingDialog(page);

  await expect(page.locator("body")).toBeVisible();
}

export async function expectNoAppCrash(page: Page): Promise<void> {
  const stableMain = page
    .locator("main:not([aria-busy='true']), [role='main']:not([aria-busy='true'])")
    .filter({ visible: true })
    .first();
  const crashContainer =
    (await stableMain.isVisible().catch(() => false)) ? stableMain : page.locator("body");

  await expect(page.getByText(/application error|unhandled exception/i)).not.toBeVisible();
  await expect(crashContainer).not.toContainText(/NaN|Infinity|undefined/);
}

export function calculatorResultsSection(page: Page): Locator {
  return page
    .locator("section")
    .filter({
      has: page.getByRole("heading", { name: /^results$/i }),
    })
    .first();
}

export function primaryResultValue(page: Page): Locator {
  return calculatorResultsSection(page).locator("p.text-3xl").first();
}

export async function expectGuestAuthPrompt(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const text = (await page.locator("body").textContent())?.toLowerCase() ?? "";
      return /welcome to pro construction calc|sign in to view saved estimates|sign up & get started|sign in/.test(
        text,
      );
    })
    .toBe(true);
}

export async function expectCalculatorShell(page: Page): Promise<void> {
  const visibleNumberInputs = page
    .locator("input[type='number']")
    .filter({ visible: true });

  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /^inputs$/i }).first(),
  ).toBeVisible();
  await expect(visibleNumberInputs.first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /^results$/i }).first(),
  ).toBeVisible();
  await expect(primaryResultValue(page)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /finalize estimate|finalize & send/i }).first(),
  ).toBeVisible();
}

export async function touchVisibleNumberInputs(
  page: Page,
  values: string[] = ["12", "10", "4"],
): Promise<void> {
  const inputs = page.locator("input[type='number']").filter({ visible: true });
  await expect(inputs.first()).toBeVisible();
  const count = await inputs.count();

  for (let index = 0; index < Math.min(count, values.length); index += 1) {
    await inputs.nth(index).fill(values[index]);
  }
}
