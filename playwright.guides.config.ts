import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const e2ePort = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const e2eBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  testDir: "./playwright-guides",
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-guides-report" }], ["list"]],
  outputDir: "artifacts/playwright-guides",
  use: {
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    baseURL: e2eBaseURL,
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
    command: `PORT=${e2ePort} npm run start:e2e`,
    url: e2eBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
  },
});
