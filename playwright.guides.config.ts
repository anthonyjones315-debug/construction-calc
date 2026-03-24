import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  testDir: "./playwright-guides",
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  reporter: [["html", { outputFolder: "playwright-guides-report" }], ["list"]],
  outputDir: "artifacts/playwright-guides",
  use: {
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "off",
    video: "on",
    ...devices["Desktop Chrome"],
    viewport: {
      width: 1440,
      height: 960,
    },
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "guide-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 1440,
          height: 960,
        },
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: /.*\.noauth\.spec\.ts/,
    },
    {
      name: "guide-public",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 1440,
          height: 960,
        },
      },
      testMatch: /.*\.noauth\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run start:e2e",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
