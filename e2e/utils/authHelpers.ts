import { Page } from "@playwright/test";

/**
 * Safely logs out a user by triggering the logout action, waiting for the
 * network request to complete, physically clearing cookies, and verifying
 * navigation to the sign-in page.
 */
export async function safeLogout(page: Page) {
  // Wait for the sign-out request (Clerk usually calls /v1/client/sessions/*/remove or similar)
  const logoutPromise = page.waitForResponse(
    (res) => res.url().includes("signout") || res.url().includes("logout") || res.url().includes("client/sessions"),
    { timeout: 5000 }
  ).catch(() => null); // Catch timeout if the request happens too fast or differently

  // Click the avatar or trigger that opens the logout menu
  // Adjust these selectors based on the actual Clerk UserButton DOM
  const userButton = page.locator('.cl-userButtonTrigger');
  if (await userButton.isVisible()) {
    await userButton.click();
    const signOutMenuButton = page.locator('.cl-userButtonPopoverActionButton:has-text("Sign out")');
    if (await signOutMenuButton.isVisible()) {
      await signOutMenuButton.click();
    }
  } else {
    // Fallback if there's a custom logout or we are just navigating
    await page.goto('/sign-in');
  }

  await logoutPromise;
  
  // Physically wipe the browser context state
  await page.context().clearCookies();
  
  // Ensure we fully land on sign-in
  await page.waitForURL(/\/sign-in/);
}
