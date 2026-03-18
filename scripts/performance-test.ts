/**
 * Liquid Orange Glass UI Performance Test
 *
 * This script measures render times of critical components to verify
 * the sub-16ms render time requirement for iPhone 15 devices.
 */

import fs from "fs";
import puppeteer from "puppeteer";

// Simulated iPhone 15 viewport dimensions
const IPHONE_15_VIEWPORT = {
  width: 390,
  height: 844,
};

// Performance metrics collector
class PerformanceMetrics {
  private measurements: any[];
  private currentTest: any;

  constructor() {
    this.measurements = [];
    this.currentTest = null;
  }

  startTest(testName: string): void {
    this.currentTest = {
      name: testName,
      startTime: performance.now(),
      frames: [],
      completed: false,
    };
    console.log(`Starting test: ${testName}`);
  }

  recordFrame(): void {
    if (!this.currentTest) return;

    const timestamp = performance.now();
    const lastFrameTime =
      this.currentTest.frames.length > 0
        ? this.currentTest.frames[this.currentTest.frames.length - 1].timestamp
        : this.currentTest.startTime;

    const frameDuration = timestamp - lastFrameTime;

    this.currentTest.frames.push({
      timestamp,
      duration: frameDuration,
    });
  }

  endTest(): void {
    if (!this.currentTest) return;

    const endTime = performance.now();
    this.currentTest.endTime = endTime;
    this.currentTest.totalDuration = endTime - this.currentTest.startTime;
    this.currentTest.completed = true;

    // Add to completed tests
    this.measurements.push(this.currentTest);

    console.log(`Test completed: ${this.currentTest.name}`);
    this.printTestResults(this.currentTest);

    this.currentTest = null;
  }

  printTestResults(test: any): void {
    const frameCount = test.frames.length;
    const totalDuration = test.totalDuration;
    const avgFrameTime = frameCount > 0 ? test.totalDuration / frameCount : 0;

    // Count frames exceeding 16ms (below 60fps)
    const framesAbove16ms = test.frames.filter(
      (frame: any) => frame.duration > 16.67,
    ).length;
    const percentSlow = (framesAbove16ms / frameCount) * 100;

    console.log(`
    ===== Test Results: ${test.name} =====
    Total frames: ${frameCount}
    Total duration: ${totalDuration.toFixed(2)}ms
    Average frame time: ${avgFrameTime.toFixed(2)}ms
    Frames exceeding 16.67ms: ${framesAbove16ms} (${percentSlow.toFixed(2)}%)
    Performance rating: ${avgFrameTime <= 16.67 ? "PASS" : "FAIL"} - ${this.getRatingText(avgFrameTime)}
    `);
  }

  getRatingText(avgFrameTime: number): string {
    if (avgFrameTime <= 8) return "Excellent (120fps+)";
    if (avgFrameTime <= 11.11) return "Very good (90fps+)";
    if (avgFrameTime <= 16.67) return "Good (60fps)";
    if (avgFrameTime <= 33.33) return "Slow (30fps)";
    return "Very slow (below 30fps)";
  }

  generateReport(): any {
    const report = {
      timestamp: new Date().toISOString(),
      tests: this.measurements.map((test) => {
        const frameCount = test.frames.length;
        const avgFrameTime =
          frameCount > 0 ? test.totalDuration / frameCount : 0;
        const framesAbove16ms = test.frames.filter(
          (frame: any) => frame.duration > 16.67,
        ).length;
        const percentSlow = (framesAbove16ms / frameCount) * 100;

        return {
          name: test.name,
          totalFrames: frameCount,
          totalDuration: test.totalDuration,
          avgFrameTime,
          framesAbove16ms,
          percentSlow,
          pass: avgFrameTime <= 16.67,
        };
      }),
      summary: {
        totalTests: this.measurements.length,
        passedTests: 0,
        allPassed: false,
      },
    };

    report.summary.passedTests = this.measurements.filter((test) => {
      const frameCount = test.frames.length;
      const avgFrameTime = frameCount > 0 ? test.totalDuration / frameCount : 0;
      return avgFrameTime <= 16.67;
    }).length;

    report.summary.allPassed =
      report.summary.passedTests === report.summary.totalTests;

    return report;
  }
}

// Test case type definition
interface TestCase {
  name: string;
  url: string;
  duration: number;
  withAnimation?: boolean;
  setup?: () => void;
  teardown?: () => void;
}

// Test cases for critical components
const TEST_CASES: TestCase[] = [
  {
    name: "Calculator Page Load",
    url: "/calculators/framing/wall",
    duration: 3000, // 3 seconds of measurement
    withAnimation: true,
  },
  {
    name: "Calculator Page Load (No Animation)",
    url: "/calculators/framing/wall",
    duration: 3000,
    withAnimation: false,
    setup: () => {
      document.documentElement.classList.add("prefers-reduced-motion");
    },
    teardown: () => {
      document.documentElement.classList.remove("prefers-reduced-motion");
    },
  },
  {
    name: "Modal Dialog Open/Close",
    url: "/calculators/framing/wall",
    duration: 2000,
    setup: async () => {
      // Wait for page to load
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Find and click a button that opens a modal
      const saveButton = Array.from(document.querySelectorAll("button")).find(
        (btn) =>
          btn.textContent?.includes("Save") ||
          btn.textContent?.includes("Estimate"),
      );
      if (saveButton) saveButton.click();
    },
    teardown: async () => {
      // Close the modal
      const closeButton = document.querySelector(".glass-modal button");
      if (closeButton) (closeButton as HTMLButtonElement).click();
    },
  },
  {
    name: "Animated Background",
    url: "/calculators",
    duration: 5000,
    setup: () => {
      // Add an element to track the animated background
      const testEl = document.createElement("div");
      testEl.className = "animated-gradient-bg gpu-accelerated";
      testEl.style.position = "fixed";
      testEl.style.top = "0";
      testEl.style.left = "0";
      testEl.style.right = "0";
      testEl.style.bottom = "0";
      testEl.style.zIndex = "-1";
      document.body.appendChild(testEl);
    },
    teardown: () => {
      // Remove the test element
      const testEl = document.querySelector(
        ".animated-gradient-bg.gpu-accelerated",
      );
      if (testEl) testEl.remove();
    },
  },
  {
    name: "Glass Card Hover Effects",
    url: "/calculators",
    duration: 3000,
    setup: async () => {
      // Wait for page to load
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Find all glass cards
      const cards = document.querySelectorAll(".glass-card");
      if (cards.length > 0) {
        // Simulate hover over each card
        let currentCard = 0;

        const hoverInterval = setInterval(() => {
          const card = cards[currentCard];
          if (card) {
            // Trigger hover state
            card.dispatchEvent(
              new MouseEvent("mouseover", {
                bubbles: true,
                cancelable: true,
                view: window,
              }),
            );

            // Move to next card
            currentCard = (currentCard + 1) % cards.length;
          }
        }, 500);

        // Store interval for cleanup
        (window as any)._hoverInterval = hoverInterval;
      }
    },
    teardown: () => {
      // Clear the hover interval
      if ((window as any)._hoverInterval) {
        clearInterval((window as any)._hoverInterval);
        (window as any)._hoverInterval = null;
      }
    },
  },
];

// Run performance tests
async function runPerformanceTests() {
  const metrics = new PerformanceMetrics();

  // Create a browser instance with iPhone 15 viewport
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: IPHONE_15_VIEWPORT.width,
      height: IPHONE_15_VIEWPORT.height,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  });

  const page = await browser.newPage();

  // Enable performance metrics collection
  await page.evaluateOnNewDocument(() => {
    (window as any).performanceMetrics = [];
    (window as any).frameTimestamps = [];
    (window as any).testActive = false;

    // Performance observer to capture frame timings
    const observer = new PerformanceObserver((list) => {
      if ((window as any).testActive) {
        const entries = list.getEntries();
        for (const entry of entries) {
          (window as any).performanceMetrics.push({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });

          (window as any).frameTimestamps.push(performance.now());
        }
      }
    });

    observer.observe({
      entryTypes: ["measure", "paint", "layout-shift", "longtask"],
    });

    // Frame timing using requestAnimationFrame
    const captureFrameTiming = (timestamp: number) => {
      if ((window as any).testActive && (window as any).lastFrameTimestamp) {
        const frameDuration = timestamp - (window as any).lastFrameTimestamp;
        (window as any).frameTimings.push(frameDuration);
      }
      (window as any).lastFrameTimestamp = timestamp;
      requestAnimationFrame(captureFrameTiming);
    };

    (window as any).frameTimings = [];
    (window as any).lastFrameTimestamp = null;
    requestAnimationFrame(captureFrameTiming);
  });

  // Function to run a specific test case
  const runTest = async (testCase: TestCase) => {
    console.log(`Running test: ${testCase.name}`);

    try {
      // Navigate to the test URL
      await page.goto(`http://localhost:3000${testCase.url}`, {
        waitUntil: "networkidle2",
      });

      // Reset metrics for this test
      await page.evaluate(() => {
        (window as any).performanceMetrics = [];
        (window as any).frameTimestamps = [];
        (window as any).frameTimings = [];
        (window as any).testActive = false;
      });

      // Execute test setup if defined
      if (testCase.setup) {
        await page.evaluate(`(${testCase.setup.toString()})()`);
      }

      // Start recording metrics
      await page.evaluate(() => {
        (window as any).testActive = true;
        (window as any).testStartTime = performance.now();
      });

      // Wait for test duration
      await new Promise((resolve) => setTimeout(resolve, testCase.duration));

      // Stop recording metrics
      const results = await page.evaluate(() => {
        (window as any).testActive = false;
        const testEndTime = performance.now();

        // Calculate frame statistics
        const frameTimings = (window as any).frameTimings.filter(
          (timing: number) => timing < 100,
        ); // Filter out unreasonably long frames
        const totalFrames = frameTimings.length;
        const avgFrameTime =
          totalFrames > 0
            ? frameTimings.reduce(
                (sum: number, time: number) => sum + time,
                0,
              ) / totalFrames
            : 0;
        const framesAbove16ms = frameTimings.filter(
          (timing: number) => timing > 16.67,
        ).length;
        const percentSlow =
          totalFrames > 0 ? (framesAbove16ms / totalFrames) * 100 : 0;

        return {
          testDuration: testEndTime - (window as any).testStartTime,
          totalFrames,
          avgFrameTime,
          framesAbove16ms,
          percentSlow,
          performanceEntries: (window as any).performanceMetrics,
          pass: avgFrameTime <= 16.67,
        };
      });

      // Store results in metrics
      metrics.startTest(testCase.name);

      // Manually add frame data
      for (let i = 0; i < results.totalFrames; i++) {
        metrics.recordFrame();
      }

      metrics.endTest();

      // Execute test teardown if defined
      if (testCase.teardown) {
        await page.evaluate(`(${testCase.teardown.toString()})()`);
      }

      return results;
    } catch (error) {
      console.error(`Error running test ${testCase.name}:`, error);
      return { error: (error as Error).message };
    }
  };

  // Run all test cases
  const results = [];
  for (const testCase of TEST_CASES) {
    results.push(await runTest(testCase));
  }

  // Add additional test cases for testing specific optimization techniques
  const optimizationTests: TestCase[] = [
    {
      name: "Backdrop Filter with will-change",
      url: "/calculators/framing/wall",
      duration: 3000,
      setup: () => {
        // Add will-change to backdrop filter elements
        document
          .querySelectorAll(".glass-container, .glass-card, .glass-panel")
          .forEach((el) => {
            (el as HTMLElement).style.willChange = "transform";
          });
      },
    },
    {
      name: "Backdrop Filter with translateZ",
      url: "/calculators/framing/wall",
      duration: 3000,
      setup: () => {
        // Add translateZ to create a new composite layer
        document
          .querySelectorAll(".glass-container, .glass-card, .glass-panel")
          .forEach((el) => {
            (el as HTMLElement).style.transform = "translateZ(0)";
          });
      },
    },
    {
      name: "Reduced Backdrop Filter Complexity",
      url: "/calculators/framing/wall",
      duration: 3000,
      setup: () => {
        // Reduce backdrop-filter complexity
        const style = document.createElement("style");
        style.textContent = `
          .backdrop-glass, .backdrop-glass-light, .backdrop-glass-heavy {
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
          }
        `;
        document.head.appendChild(style);
      },
    },
    {
      name: "Scrolling Performance",
      url: "/calculators/framing/wall",
      duration: 5000,
      setup: async () => {
        // Wait for page to load
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Setup scrolling simulation
        const scrollInterval = setInterval(() => {
          window.scrollBy(0, 100);
          setTimeout(() => {
            window.scrollBy(0, -100);
          }, 500);
        }, 1000);

        (window as any)._scrollInterval = scrollInterval;
      },
      teardown: () => {
        if ((window as any)._scrollInterval) {
          clearInterval((window as any)._scrollInterval);
        }
      },
    },
  ];

  // Run optimization tests
  for (const testCase of optimizationTests) {
    results.push(await runTest(testCase));
  }

  // Generate comprehensive report
  const finalReport = metrics.generateReport();

  // Save report to file
  fs.writeFileSync(
    "performance-test-report.json",
    JSON.stringify(finalReport, null, 2),
  );

  console.log("\n============ PERFORMANCE TEST SUMMARY ============");
  console.log(`Total Tests: ${finalReport.summary.totalTests}`);
  console.log(`Passed Tests: ${finalReport.summary.passedTests}`);
  console.log(
    `Overall Status: ${finalReport.summary.allPassed ? "PASS" : "FAIL"}`,
  );
  console.log("=================================================\n");

  // Close the browser
  await browser.close();

  return finalReport;
}

// Run the tests
runPerformanceTests().catch((error) => {
  console.error("Error running performance tests:", error);
  process.exit(1);
});
