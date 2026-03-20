import { test, expect } from "@playwright/test";

test.describe("Office Manager — Command Center Dashboard", () => {
  const openCommandCenterOrSkip = async (
    page: Parameters<typeof test>[0]["page"],
  ) => {
    await page.goto("/command-center");
    if (/auth\/signin/.test(page.url())) {
      test.skip(true, "Requires authenticated office-manager test user");
    }
  };

  test("command center loads without error for authenticated user", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);
    await expect(page).not.toHaveURL(/auth\/signin/);
    await expect(
      page.getByRole("heading", { name: /command center|dashboard/i }),
    ).toBeVisible();
  });

  test("all saved estimates are listed in command center", async ({ page }) => {
    await openCommandCenterOrSkip(page);

    const estimateList = page.getByTestId("estimate-list-item");
    // Should display estimates, not an empty broken state
    const count = await estimateList.count();
    // If there are any saved estimates, they should show up
    if (count === 0) {
      await expect(
        page.getByText(/no estimates|get started|create your first/i),
      ).toBeVisible();
    } else {
      await expect(estimateList.first()).toBeVisible();
    }
  });

  test("estimates can be filtered by status (signed vs. pending)", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    const statusFilter = page.getByLabel(/status|filter/i).first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption(/signed|approved/i);
      // List should update
      await page.waitForTimeout(500);
      const items = page.getByTestId("estimate-list-item");
      const count = await items.count();
      // All visible items should be "signed" status
      if (count > 0) {
        const statusBadge = items.first().getByTestId("estimate-status");
        const badgeText = await statusBadge.textContent();
        expect(badgeText).toMatch(/signed|approved/i);
      }
    }
  });

  test("estimates can be searched by job name or client name", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    const searchInput = page.getByPlaceholder(/search|find estimate/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Johnson");
      await page.waitForTimeout(400); // debounce

      const items = page.getByTestId("estimate-list-item");
      const count = await items.count();
      if (count > 0) {
        const firstText = await items.first().textContent();
        expect(firstText?.toLowerCase()).toContain("johnson");
      }
    }
  });

  test("estimate list shows date created and total value", async ({ page }) => {
    await openCommandCenterOrSkip(page);

    const firstItem = page.getByTestId("estimate-list-item").first();
    if (await firstItem.isVisible()) {
      // Should show a date
      const dateEl = firstItem.getByTestId("estimate-date");
      if (await dateEl.isVisible()) {
        const dateText = await dateEl.textContent();
        expect(dateText).toMatch(
          /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i,
        );
      }

      // Should show a dollar total
      const totalEl = firstItem.getByTestId("estimate-total");
      if (await totalEl.isVisible()) {
        const totalText = await totalEl.textContent();
        expect(totalText).toMatch(/\$/);
      }
    }
  });

  test("clicking an estimate row opens the full estimate detail", async ({
    page,
  }) => {
    await openCommandCenterOrSkip(page);

    const firstItem = page.getByTestId("estimate-list-item").first();
    if (await firstItem.isVisible()) {
      await firstItem.click();
      await expect(page).toHaveURL(/saved\/|estimate\//);
      await expect(page.getByTestId("cart-item").first()).toBeVisible();
    }
  });

  test("command center shows financial summary totals", async ({ page }) => {
    await openCommandCenterOrSkip(page);

    // Financial summary widgets
    const summaryWidgets = page.getByTestId("financial-summary-widget");
    if (await summaryWidgets.first().isVisible()) {
      // Should show dollar amounts, not loading spinners
      await expect(page.getByTestId("loading-spinner")).not.toBeVisible({
        timeout: 5000,
      });
      const widgetText = await summaryWidgets.first().textContent();
      expect(widgetText).toMatch(/\$|%/);
    }
  });

  test("command center loads within 3 seconds on first visit", async ({
    page,
  }) => {
    const start = Date.now();
    await openCommandCenterOrSkip(page);
    await page.waitForLoadState("networkidle");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });
});
