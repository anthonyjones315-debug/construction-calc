import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const e2ePort = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const e2eBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;
const isCI = !!process.env.CI;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  testDir: "./e2e",
  /* Generous timeout for 8GB MacBook — cold starts are slow */
  timeout: 120_000,
  expect: {
    timeout: 20_000,
  },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  /* Single worker locally to avoid OOM on 8GB RAM */
  workers: isCI ? 2 : 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    baseURL: e2eBaseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    /* Disable video locally to save memory; keep on CI */
    video: isCI ? "retain-on-failure" : "off",
  },
  projects: [
    // Auth setup project — runs first, creates session storage
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    // ── Local: Chromium-only to conserve RAM ─────────────────
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      testIgnore: /.*\.noauth\.spec\.ts/,
      dependencies: ["setup"],
    },
    // ── CI-only browsers (skipped locally) ───────────────────
    ...(isCI
      ? [
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
        ]
      : []),
    // Unauthenticated — public routes only
    {
      name: "no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.noauth\.spec\.ts/,
    },
    // Video capture — cinematic onboarding recording (CI only)
    ...(isCI
      ? [
          {
            name: "video-capture",
            use: {
              ...devices["Desktop Chrome"],
              viewport: { width: 1920, height: 1080 },
              video: "on" as const,
              storageState: "e2e/.auth/user.json",
            },
            testMatch: /.*video-capture.*\.spec\.ts/,
            dependencies: ["setup"],
          },
        ]
      : []),
  ],
  webServer: {
    command: `PORT=${e2ePort} npm run start:e2e`,
    url: e2eBaseURL,
    reuseExistingServer: !isCI,
    /* Allow 15 min for first build on 8GB MacBook */
    timeout: 900_000,
  },
});
