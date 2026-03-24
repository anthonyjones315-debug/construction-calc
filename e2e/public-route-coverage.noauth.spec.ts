import { test, expect } from "@playwright/test";
import { gotoReady, expectNoAppCrash } from "./lib/app";
import { publicPageChecks } from "./lib/routes";

test.describe("Public route coverage", () => {
  for (const pageCheck of publicPageChecks) {
    test(`route ${pageCheck.route} renders without crashing`, async ({
      page,
    }) => {
      await gotoReady(page, pageCheck.route);
      if ("url" in pageCheck && pageCheck.url) {
        await expect(page).toHaveURL(pageCheck.url);
      }
      await expect(page).toHaveTitle(pageCheck.title);
      await expectNoAppCrash(page);
    });
  }
});
