import { test, expect } from "@playwright/test";
import { gotoReady, expectNoAppCrash } from "./lib/app";
import { publicPageChecks } from "./lib/routes";

test.describe("Public route coverage", () => {
  for (const pageCheck of publicPageChecks) {
    test(`route ${pageCheck.route} renders without crashing`, async ({
      page,
    }) => {
      await gotoReady(page, pageCheck.route);
      await expect(
        page.getByRole("heading", { name: pageCheck.heading }).first(),
      ).toBeVisible();
      await expectNoAppCrash(page);
    });
  }
});
