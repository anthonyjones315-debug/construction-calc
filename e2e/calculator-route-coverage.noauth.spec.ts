import { test } from "@playwright/test";
import {
  expectCalculatorShell,
  expectNoAppCrash,
  gotoReady,
  touchVisibleNumberInputs,
} from "./lib/app";
import { calculatorRoutes } from "./lib/routes";

test.describe("Calculator route coverage", () => {
  for (const route of calculatorRoutes) {
    test(`${route} renders a stable calculator shell`, async ({ page }) => {
      await gotoReady(page, route);
      await expectCalculatorShell(page);
      await touchVisibleNumberInputs(page);
      await expectCalculatorShell(page);
      await expectNoAppCrash(page);
    });
  }
});
