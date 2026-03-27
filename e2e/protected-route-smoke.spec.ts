import { test, expect } from "./lib/test-fixtures";
import { expectNoAppCrash, gotoReady } from "./lib/app";
import { protectedSmokeRoutes } from "./lib/routes";

test.describe("Protected route smoke", () => {
  for (const pageCheck of protectedSmokeRoutes) {
    test(`${pageCheck.route} renders for authenticated users`, async ({
      page,
    }) => {
      await gotoReady(page, pageCheck.route);
      await expect(
        page.getByRole("heading", { name: pageCheck.heading }).first(),
      ).toBeVisible();
      await expect(page).not.toHaveURL(/\/sign-in/);
      await expectNoAppCrash(page);
    });
  }
});
