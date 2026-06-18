import { test, expect } from '@playwright/test';

test('verify large click target and accessibility', async ({ page }) => {
  await page.goto('/calculators/concrete/slab');

  // Wait for the page to load
  await page.waitForSelector('h1:has-text("Professional Concrete Slab")');

  // Handle cookie banner if it appears
  const acceptButton = page.getByRole('button', { name: /accept/i });
  if (await acceptButton.isVisible()) {
    await acceptButton.click();
  }

  // Find the Slab Thickness ProInput
  // It should be a fieldset because it has a unit select (inches)
  const thicknessLabel = page.getByText('Slab Thickness', { exact: true });
  await expect(thicknessLabel).toBeVisible();

  // Clicking the label should focus the input
  await thicknessLabel.click();

  // Check if the input is focused
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  console.log('Focused element ID after clicking Slab Thickness:', focusedId);

  // The Slab Thickness input should have an ID
  expect(focusedId).toBeTruthy();

  // Find the Slab Length FeetInchesInput
  const lengthLabel = page.getByText('Slab Length (ft/in)', { exact: true });
  await expect(lengthLabel).toBeVisible();

  // Clicking the label should focus the feet input
  await lengthLabel.click();
  const focusedIdLength = await page.evaluate(() => document.activeElement?.id);
  console.log('Focused element ID after clicking Slab Length:', focusedIdLength);
  expect(focusedIdLength).toContain('-ft');

  await page.screenshot({ path: '/home/jules/verification/verification_v2.png', fullPage: true });
});
