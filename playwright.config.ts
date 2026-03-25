import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const e2ePort = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const e2eBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [["html"], ["list"]],
  use: {
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    baseURL: e2eBaseURL,
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
      testIgnore: /.*\.noauth\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "e2e/.auth/user.json",
      },
      testIgnore: /.*\.noauth\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "e2e/.auth/user.json",
      },
      testIgnore: /.*\.noauth\.spec\.ts/,
      dependencies: ["setup"],
    },
    // Mobile — contractor's actual device
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        storageState: "e2e/.auth/user.json",
      },
      testIgnore: /.*\.noauth\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 14"],
        storageState: "e2e/.auth/user.json",
      },
      testIgnore: /.*\.noauth\.spec\.ts/,
      dependencies: ["setup"],
    },
    // Unauthenticated — public routes only
    {
      name: "no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.noauth\.spec\.ts/,
    },
    // Video capture — cinematic onboarding recording
    {
      name: "video-capture",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        video: "on",
        storageState: "e2e/.auth/user.json",
      },
      testMatch: /.*video-capture.*\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `PORT=${e2ePort} npm run start:e2e`,
    url: e2eBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
  },
});
