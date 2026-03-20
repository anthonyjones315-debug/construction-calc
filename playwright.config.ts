import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    // Auth setup project — runs first, creates session storage
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    // Desktop browsers — authenticated
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // Mobile — contractor's actual device
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 14"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // Unauthenticated — public routes only
    {
      name: "no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.noauth\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
