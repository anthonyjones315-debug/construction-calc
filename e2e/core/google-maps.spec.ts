import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test.describe("Google Maps & Location Features", () => {
  const dismissCookies = async (page: Page) => {
    const acceptBtn = page.getByRole("button", { name: /accept/i });
    try {
      await acceptBtn.waitFor({ state: "visible", timeout: 3000 });
      await acceptBtn.click();
      await acceptBtn.waitFor({ state: "hidden", timeout: 2000 });
    } catch {
      /* banner not present */
    }
  };

  test("Address autocomplete renders and functions", async ({ page }) => {
    // Authenticate if needed for certain pages, though New Estimate requires it
    await setupClerkTestingToken({ page });
    await page.goto("/command-center/estimates/new");
    await dismissCookies(page);

    await expect(
      page.getByRole("heading", { name: /create new estimate/i }),
    ).toBeVisible();

    // The address input should be rendered
    const addressInput = page.getByPlaceholder(/search for an address/i).or(page.getByPlaceholder(/enter job site address/i)).first();
    await expect(addressInput).toBeVisible();

    // Type an address
    await addressInput.pressSequentially("1600 Amphitheatre Parkway", { delay: 50 });

    // Wait for the Google Places autocomplete dropdown
    // Google places puts results in elements with class "pac-item"
    const suggestion = page.locator(".pac-item").first();
    await expect(suggestion).toBeVisible({ timeout: 10_000 });

    // Mock click the suggestion
    await suggestion.click();
    
    // The input value should be updated
    await expect(addressInput).toHaveValue(/Mountain View/i);
  });

  test("Use My Location asks for permission and fills address", async ({ context, page }) => {
    await setupClerkTestingToken({ page });
    
    // Grant geolocation permissions and mock the location
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 }); // NYC

    // Intercept Google Maps reverse geocoding API to prevent huge billing costs and test reliability
    await page.route("https://maps.googleapis.com/maps/api/geocode/json*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "OK",
          results: [
            { formatted_address: "City Hall Park, New York, NY 10007, USA" }
          ]
        })
      });
    });

    await page.goto("/command-center/estimates/new");
    await dismissCookies(page);

    const locationBtn = page.getByRole("button", { name: /use my location/i });
    if (await locationBtn.isVisible()) {
      await locationBtn.click();
      // Should fill the address input with the reverse-geocoded location
      const addressInput = page.getByPlaceholder(/search for an address/i).or(page.getByPlaceholder(/enter job site address/i)).first();
      await expect(addressInput).toHaveValue(/New York, NY/i, { timeout: 10_000 });
    }
  });

  test("Map renders correctly when an address is provided", async ({ page }) => {
    await setupClerkTestingToken({ page });
    
    await page.goto("/command-center/estimates/new");
    await dismissCookies(page);

    // Some pages might only show the map after an address is filled.
    const addressInput = page.getByPlaceholder(/search for an address/i).or(page.getByPlaceholder(/enter job site address/i)).first();
    if (await addressInput.isVisible()) {
      await addressInput.fill("Space Needle, Seattle, WA");
      await page.locator(".pac-item").first().click().catch(() => {});
    }

    // Google maps iframe should explicitly render
    const mapIframe = page.locator('iframe[src*="google.com/maps/embed"]').first();
    // It might take a moment to load the API and render
    await expect(mapIframe).toBeVisible({ timeout: 15_000 });
  });
});
