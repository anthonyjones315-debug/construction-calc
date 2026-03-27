import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from './lib/test-fixtures'

test.describe('Clerk testing setup', () => {
  test('verify sign up page bypasses bot detection', async ({ page }) => {
    await setupClerkTestingToken({ page })

    await page.goto('/sign-up')
    
    // Verify the page loaded correctly (not blocked by bot detection)
    await expect(page).toHaveURL(/\/sign-up/)
    // Clerk may render different heading text; just verify the form loaded
    await expect(
      page.locator('h1').or(page.locator('input[name="identifier"], input[name="emailAddress"]')).first()
    ).toBeVisible()
  })

  test('verify sign in page bypasses bot detection', async ({ page }) => {
    await setupClerkTestingToken({ page })

    await page.goto('/sign-in')
    
    // Verify the page loaded correctly (not blocked by bot detection)
    await expect(page).toHaveURL(/\/sign-in/)
    // Clerk may render different heading text; just verify the form loaded
    await expect(
      page.locator('h1').or(page.locator('input[name="identifier"]')).first()
    ).toBeVisible()
  })
})
