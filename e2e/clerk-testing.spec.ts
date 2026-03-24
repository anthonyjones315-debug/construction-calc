import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

test.describe('Clerk testing setup', () => {
  test('verify sign up page bypasses bot detection', async ({ page }) => {
    await setupClerkTestingToken({ page })

    await page.goto('/sign-up')
    
    // Verify the page loaded correctly
    await expect(page).toHaveURL(/\/sign-up/)
    await expect(page.locator('h1')).toContainText(/Create your account/i)
  })

  test('verify sign in page bypasses bot detection', async ({ page }) => {
    await setupClerkTestingToken({ page })

    await page.goto('/sign-in')
    
    // Verify the page loaded correctly
    await expect(page).toHaveURL(/\/sign-in/)
    await expect(page.locator('h1')).toContainText(/Sign in/i)
  })
})
