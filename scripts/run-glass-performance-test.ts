/**
 * Run the Liquid Orange Glass performance tests in a browser with iPhone 15 dimensions
 * This script launches a browser, loads the application, and injects the performance testing code
 */
import puppeteer, { type Page } from "puppeteer";
import path from "node:path";
import fs from "node:fs/promises";
import URL from "node:url";

const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iPhone 15 viewport dimensions
const IPHONE_15_VIEWPORT = {
  width: 393,
  height: 844,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

// Test configuration
const TEST_CONFIG = {
  baseUrl: "http://localhost:3000",
  timeout: 60000,
  screenshotDir: path.join(__dirname, "../performance-test-results"),
  reportPath: path.join(__dirname, "../performance-test-results/report.json"),
};

type WaitOperation = {
  wait: number;
};

type ClickTextOperation = {
  action: "clickText";
  texts: string[];
  waitForSelector?: string;
};

type HoverOperation = {
  action: "hover";
  selector: string;
};

type ScrollOperation = {
  action: "scroll";
  distance: number;
};

type TestOperation =
  | WaitOperation
  | ClickTextOperation
  | HoverOperation
  | ScrollOperation;

type TestWorkflow = {
  name: string;
  url: string;
  waitFor: string;
  operations?: TestOperation[];
  testDuration: number;
};

type PerformanceStats = {
  avgFrameTime: number;
  framesAbove16ms: number;
  percentSlow: number;
  fps: number;
};

type BrowserTestResult = {
  name: string;
  stats: PerformanceStats;
};

// Test workflow - pages to test and operations to perform
const TEST_WORKFLOW: TestWorkflow[] = [
  {
    name: "Calculator Page Load",
    url: "/calculators/framing/wall",
    waitFor: ".glass-container",
    testDuration: 3000,
  },
  {
    name: "Modal Dialog Open/Close",
    url: "/calculators/framing/wall",
    waitFor: ".glass-container",
    operations: [
      {
        action: "clickText",
        texts: ["Finalize & Send", "Save Estimate", "Save"],
        waitForSelector: ".glass-modal",
      },
      { wait: 2000 },
      {
        action: "clickText",
        texts: ["Close Finalize & Send", "Cancel", "Close"],
      },
    ],
    testDuration: 4000,
  },
  {
    name: "Animated Background",
    url: "/calculators",
    waitFor: ".animated-gradient-bg",
    testDuration: 5000,
  },
  {
    name: "Glass Card Hover Effects",
    url: "/calculators",
    waitFor: ".glass-card",
    operations: [
      { action: "hover", selector: ".glass-card:nth-child(1)" },
      { wait: 500 },
      { action: "hover", selector: ".glass-card:nth-child(2)" },
      { wait: 500 },
      { action: "hover", selector: ".glass-card:nth-child(3)" },
    ],
    testDuration: 5000,
  },
  {
    name: "Scrolling Performance",
    url: "/calculators",
    waitFor: "main",
    operations: [
      { action: "scroll", distance: 300 },
      { wait: 500 },
      { action: "scroll", distance: 300 },
      { wait: 500 },
      { action: "scroll", distance: -300 },
    ],
    testDuration: 5000,
  },
];

// Optimization strategies to test
const OPTIMIZATIONS = [
  {
    name: "Will Change Transform",
    code: `
      document.querySelectorAll('.glass-container, .glass-card, .glass-panel').forEach(el => {
        el.style.willChange = 'transform';
      });
      console.log('Applied will-change: transform optimization');
    `,
  },
  {
    name: "TranslateZ Layer",
    code: `
      document.querySelectorAll('.glass-container, .glass-card, .glass-panel').forEach(el => {
        el.style.transform = 'translateZ(0)';
      });
      console.log('Applied translateZ(0) optimization');
    `,
  },
  {
    name: "Reduced Backdrop Filter",
    code: `
      const style = document.createElement('style');
      style.textContent = \`
        .backdrop-glass, .backdrop-glass-light, .backdrop-glass-heavy {
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }
      \`;
      document.head.appendChild(style);
      console.log('Applied reduced backdrop-filter complexity');
    `,
  },
];

// Load the performance test script
async function loadPerformanceScript() {
  const scriptPath = path.join(
    __dirname,
    "liquid-orange-glass-performance-test.js",
  );
  const scriptContent = await fs.readFile(scriptPath, "utf-8");
  return scriptContent;
}

// Helper function to wait for a specific time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Execute a test workflow
async function runTestWorkflow(
  page: Page,
  workflow: TestWorkflow,
  optimization?: (typeof OPTIMIZATIONS)[0],
): Promise<BrowserTestResult | null> {
  console.log(
    `\n🧪 Running test: ${workflow.name}${optimization ? ` with ${optimization.name}` : ""}`,
  );

  // Navigate to the test URL
  await page.goto(`${TEST_CONFIG.baseUrl}${workflow.url}`, {
    waitUntil: "domcontentloaded",
    timeout: TEST_CONFIG.timeout,
  });

  // Wait for content to be ready
  if (workflow.waitFor) {
    await page.waitForSelector(workflow.waitFor, {
      timeout: TEST_CONFIG.timeout,
    });
  }

  // Apply optimization if specified
  if (optimization) {
    await page.evaluate(optimization.code);
  }

  // Start the performance test
  await page.evaluate(
    `window.glassPerformance.startTest('${workflow.name}${optimization ? ` + ${optimization.name}` : ""}', ${workflow.testDuration})`,
  );

  // Perform operations if specified
  if (workflow.operations) {
    for (const operation of workflow.operations) {
      if ("wait" in operation) {
        await wait(operation.wait);
      } else if (operation.action === "clickText") {
        const clicked = await page.evaluate(
          ({ texts }: { texts: string[] }) => {
            const normalizedTexts = texts.map((text: string) =>
              text.trim().toLowerCase(),
            );
            const candidates = Array.from(
              document.querySelectorAll<HTMLElement>(
                'button, [role="button"], a[aria-label]',
              ),
            );

            const target = candidates.find((element) => {
              const text = element.innerText?.trim().toLowerCase();
              const ariaLabel = element.getAttribute("aria-label")?.trim().toLowerCase();
              return normalizedTexts.some(
                (candidate: string) =>
                  text === candidate || ariaLabel === candidate,
              );
            });

            target?.click();
            return Boolean(target);
          },
          { texts: operation.texts },
        );

        if (!clicked) {
          throw new Error(
            `Unable to find clickable text target for: ${operation.texts.join(", ")}`,
          );
        }

        if (operation.waitForSelector) {
          await page.waitForSelector(operation.waitForSelector);
        }
      } else if (operation.action === "hover") {
        await page.hover(operation.selector);
      } else if (operation.action === "scroll") {
        await page.evaluate(`window.scrollBy(0, ${operation.distance})`);
      }
    }
  }

  // Wait for test to complete
  await wait(workflow.testDuration + 500);

  // Take screenshot
  const screenshotFile = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}${
    optimization
      ? `-${optimization.name.replace(/\s+/g, "-").toLowerCase()}`
      : ""
  }.png`;
  await page.screenshot({
    path: path.join(TEST_CONFIG.screenshotDir, screenshotFile),
  });

  // Get test results
  const results = (await page.evaluate(
    `window.glassPerformance.tests[window.glassPerformance.tests.length - 1]`,
  )) as BrowserTestResult | null;

  return results;
}

// Main function to run all performance tests
async function runPerformanceTests() {
  console.log("🚀 Starting Liquid Orange Glass UI Performance Tests");
  console.log(
    `📱 Testing with iPhone 15 viewport: ${IPHONE_15_VIEWPORT.width}x${IPHONE_15_VIEWPORT.height}`,
  );

  // Create results directory if it doesn't exist
  await fs.mkdir(TEST_CONFIG.screenshotDir, { recursive: true });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: process.env.PUPPETEER_HEADLESS === "false" ? false : true,
    defaultViewport: IPHONE_15_VIEWPORT,
  });

  try {
    const page = await browser.newPage();

    // Load performance test script
    const perfBenchmarkScript = await loadPerformanceScript();
    await page.evaluateOnNewDocument(perfBenchmarkScript);

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as Array<{
        name: string;
        optimization?: string;
        avgFrameTime?: number;
        framesAbove16ms?: number;
        percentSlow?: number;
        fps?: number;
        passed?: boolean;
      }>,
      summary: {
        totalTests: 0,
        passedTests: 0,
        allPassed: false,
        recommendations: [] as string[],
      },
    };

    // Run baseline tests
    for (const workflow of TEST_WORKFLOW) {
      const testResult = await runTestWorkflow(page, workflow);
      if (testResult) {
        results.tests.push({
          name: workflow.name,
          avgFrameTime: testResult.stats.avgFrameTime,
          framesAbove16ms: testResult.stats.framesAbove16ms,
          percentSlow: testResult.stats.percentSlow,
          fps: testResult.stats.fps,
          passed: testResult.stats.avgFrameTime <= 16.67,
        });
      }
    }

    // Run optimization tests
    for (const workflow of TEST_WORKFLOW) {
      for (const optimization of OPTIMIZATIONS) {
        const testResult = await runTestWorkflow(page, workflow, optimization);
        if (testResult) {
          results.tests.push({
            name: workflow.name,
            optimization: optimization.name,
            avgFrameTime: testResult.stats.avgFrameTime,
            framesAbove16ms: testResult.stats.framesAbove16ms,
            percentSlow: testResult.stats.percentSlow,
            fps: testResult.stats.fps,
            passed: testResult.stats.avgFrameTime <= 16.67,
          });
        }
      }
    }

    // Calculate summary
    results.summary.totalTests = results.tests.length;
    results.summary.passedTests = results.tests.filter((t) => t.passed).length;
    results.summary.allPassed = results.tests.every((t) => t.passed);

    // Generate optimization recommendations
    const failedTests = results.tests.filter(
      (t) => !t.passed && !t.optimization,
    );
    if (failedTests.length > 0) {
      results.summary.recommendations.push(
        "Apply will-change: transform to heavy backdrop-filter elements",
      );
      results.summary.recommendations.push(
        "Use translateZ(0) for complex animating elements",
      );
      results.summary.recommendations.push(
        "Consider reducing backdrop-filter complexity on mobile",
      );
      results.summary.recommendations.push(
        "Add GPU acceleration for animated gradient backgrounds",
      );
    }

    // Save results
    await fs.writeFile(
      TEST_CONFIG.reportPath,
      JSON.stringify(results, null, 2),
    );

    // Print results summary
    console.log("\n📊 Performance Test Results");
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed Tests: ${results.summary.passedTests}`);
    console.log(
      `Failed Tests: ${results.summary.totalTests - results.summary.passedTests}`,
    );
    console.log(
      `Overall Status: ${results.summary.allPassed ? "✅ PASSED" : "❌ FAILED"}`,
    );
    if (results.summary.recommendations.length > 0) {
      console.log("\n⚠️ Recommendations:");
      results.summary.recommendations.forEach((rec) =>
        console.log(` - ${rec}`),
      );
    }
    console.log(`\nDetailed results saved to: ${TEST_CONFIG.reportPath}`);
    console.log(`Screenshots saved to: ${TEST_CONFIG.screenshotDir}`);
  } finally {
    await browser.close();
  }
}

// Run the tests
runPerformanceTests().catch((error) => {
  console.error("Error running performance tests:", error);
  process.exit(1);
});
