/**
 * Liquid Orange Glass UI Performance Test
 *
 * This script measures render times of critical components to verify
 * the sub-16ms render time requirement for iPhone 15 devices.
 *
 * To use:
 * 1. Open the app in a browser with an iPhone 15-aligned viewport (393x844 app shell)
 * 2. Open developer tools console
 * 3. Paste and run this script
 * 4. Navigate through the application to test various components
 */

// Self-executing function to avoid polluting global scope
(function () {
  const BRAND_PRIMARY = "var(--color-primary, #ea580c)";
  const HEADER_STYLE = `font-weight: bold; color: ${BRAND_PRIMARY};`;
  const GLASS_SELECTOR =
    ".glass-container, .glass-card, .glass-panel, .glass-modal, .glass-gpu";

  // Performance test configuration
  const config = {
    reportingInterval: 1000, // Report metrics every 1 second
    measurementDuration: 5000, // Default test duration in ms
    targetFps: 60, // Target frames-per-second
    frameTimeThreshold: 16.67, // ms (1000ms / 60fps)
  };

  // Performance metrics collector
  class PerformanceMetrics {
    constructor() {
      this.isRunning = false;
      this.tests = [];
      this.currentTest = null;
      this.frameTimings = [];
      this.lastFrameTimestamp = null;
      this.longTasks = [];
      this.layoutShifts = [];
      this.reportingInterval = null;

      // Set up performance observer for long tasks
      if ("PerformanceObserver" in window) {
        // Long task observer
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            if (this.isRunning) {
              const entries = list.getEntries();
              this.longTasks = this.longTasks.concat(entries);
              console.log(
                `⚠️ Long task detected: ${entries[0].duration.toFixed(2)}ms`,
              );
            }
          });
          longTaskObserver.observe({ entryTypes: ["longtask"] });
        } catch (e) {
          console.warn("Long task observation not supported", e);
        }

        // Layout shift observer
        try {
          const layoutShiftObserver = new PerformanceObserver((list) => {
            if (this.isRunning) {
              const entries = list.getEntries();
              this.layoutShifts = this.layoutShifts.concat(entries);
            }
          });
          layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });
        } catch (e) {
          console.warn("Layout shift observation not supported", e);
        }
      }

      // Set up frame timing with rAF
      this.setupFrameTiming();
    }

    setupFrameTiming() {
      const captureFrame = (timestamp) => {
        // Calculate frame duration if we have a previous timestamp
        if (this.isRunning && this.lastFrameTimestamp) {
          const frameDuration = timestamp - this.lastFrameTimestamp;
          this.frameTimings.push(frameDuration);

          // Log slow frames
          if (frameDuration > config.frameTimeThreshold) {
            console.warn(
              `🔴 Slow frame: ${frameDuration.toFixed(2)}ms (target: ${config.frameTimeThreshold}ms)`,
            );
          }
        }

        this.lastFrameTimestamp = timestamp;
        requestAnimationFrame(captureFrame);
      };

      requestAnimationFrame(captureFrame);
    }

    startTest(name, duration = config.measurementDuration) {
      if (this.isRunning) {
        console.warn("Test already running. Stop current test first.");
        return;
      }

      console.log(
        `%c🧪 Starting test: ${name}`,
        `${HEADER_STYLE} font-size: 14px;`,
      );

      this.isRunning = true;
      this.currentTest = {
        name,
        startTime: performance.now(),
        endTime: null,
        duration: 0,
        frameTimings: [],
        longTasks: [],
        layoutShifts: [],
        stats: {},
      };

      this.frameTimings = [];
      this.longTasks = [];
      this.layoutShifts = [];

      // Set up periodic reporting
      this.reportingInterval = setInterval(() => {
        this.reportCurrentMetrics();
      }, config.reportingInterval);

      // Auto-end test after specified duration
      setTimeout(() => {
        if (this.isRunning) {
          this.endTest();
        }
      }, duration);
    }

    reportCurrentMetrics() {
      if (!this.isRunning || this.frameTimings.length === 0) return;

      const stats = this.calculateStats(this.frameTimings);

      console.log(
        `%c📊 Current metrics: ${this.frameTimings.length} frames, ` +
          `avg: ${stats.avgFrameTime.toFixed(2)}ms, ` +
          `slow frames: ${stats.framesAbove16ms} (${stats.percentSlow.toFixed(1)}%)`,
        "color: #3b82f6;",
      );
    }

    calculateStats(frameTimings) {
      if (!frameTimings.length) return {};

      // Filter extreme outliers (e.g. visibility change)
      const filteredTimings = frameTimings.filter((t) => t < 100);

      const totalFrames = filteredTimings.length;
      const totalDuration = filteredTimings.reduce((sum, t) => sum + t, 0);
      const avgFrameTime = totalDuration / totalFrames;
      const framesAbove16ms = filteredTimings.filter(
        (t) => t > config.frameTimeThreshold,
      ).length;
      const percentSlow = (framesAbove16ms / totalFrames) * 100;

      return {
        totalFrames,
        totalDuration,
        avgFrameTime,
        framesAbove16ms,
        percentSlow,
        fps: 1000 / avgFrameTime,
      };
    }

    endTest() {
      if (!this.isRunning) return;

      const endTime = performance.now();
      this.isRunning = false;

      if (this.reportingInterval) {
        clearInterval(this.reportingInterval);
        this.reportingInterval = null;
      }

      // Copy collected data to test
      this.currentTest.frameTimings = [...this.frameTimings];
      this.currentTest.longTasks = [...this.longTasks];
      this.currentTest.layoutShifts = [...this.layoutShifts];
      this.currentTest.endTime = endTime;
      this.currentTest.duration = endTime - this.currentTest.startTime;

      // Calculate stats
      this.currentTest.stats = this.calculateStats(this.frameTimings);

      // Add to completed tests
      this.tests.push(this.currentTest);

      // Print results
      this.printTestResults(this.currentTest);

      // Reset current state
      this.frameTimings = [];
      this.longTasks = [];
      this.layoutShifts = [];
      this.currentTest = null;
    }

    printTestResults(test) {
      const stats = test.stats;
      const passed = stats.avgFrameTime <= config.frameTimeThreshold;

      console.log(
        `%c===== TEST RESULTS: ${test.name.toUpperCase()} =====`,
        `${HEADER_STYLE} font-size: 16px;`,
      );

      console.log(
        `%cTotal duration: ${test.duration.toFixed(2)}ms`,
        "font-size: 14px",
      );
      console.log(`%cTotal frames: ${stats.totalFrames}`, "font-size: 14px");
      console.log(
        `%cAverage frame time: ${stats.avgFrameTime.toFixed(2)}ms`,
        "font-size: 14px",
      );
      console.log(
        `%cCalculated FPS: ${stats.fps.toFixed(1)}`,
        "font-size: 14px",
      );
      console.log(
        `%cFrames exceeding ${config.frameTimeThreshold}ms: ${stats.framesAbove16ms} (${stats.percentSlow.toFixed(2)}%)`,
        "font-size: 14px",
      );
      console.log(`%cLong tasks: ${test.longTasks.length}`, "font-size: 14px");
      console.log(
        `%cCumulative Layout Shifts: ${test.layoutShifts.length}`,
        "font-size: 14px",
      );

      const ratingColor = passed ? "#16a34a" : "#dc2626";
      console.log(
        `%cPerformance Rating: ${passed ? "PASS ✓" : "FAIL ✗"}`,
        `font-weight: bold; font-size: 16px; color: ${ratingColor}`,
      );

      if (!passed) {
        console.log("%cRecommendations:", "font-weight: bold; font-size: 14px");
        console.log(
          "• Apply will-change: transform to heavy backdrop-filter elements",
        );
        console.log("• Use translateZ(0) for complex animating elements");
        console.log("• Reduce backdrop-filter complexity on mobile");
        console.log("• Consider fallback UI for low-end devices");
      }
    }

    generateReport() {
      const report = {
        timestamp: new Date().toISOString(),
        tests: this.tests.map((test) => {
          return {
            name: test.name,
            duration: test.duration,
            stats: test.stats,
            pass: test.stats.avgFrameTime <= config.frameTimeThreshold,
          };
        }),
        summary: {
          totalTests: this.tests.length,
          passedTests: this.tests.filter(
            (t) => t.stats.avgFrameTime <= config.frameTimeThreshold,
          ).length,
        },
      };

      report.summary.allPassed =
        report.summary.passedTests === report.summary.totalTests;

      console.log(
        "%c=============== FINAL REPORT ===============",
        `${HEADER_STYLE} font-size: 16px;`,
      );

      console.table(
        report.tests.map((t) => ({
          name: t.name,
          avgFrameTime: t.stats.avgFrameTime.toFixed(2) + "ms",
          fps: t.stats.fps.toFixed(1),
          slowFrames: t.stats.percentSlow.toFixed(1) + "%",
          status: t.pass ? "PASS ✓" : "FAIL ✗",
        })),
      );

      console.log(
        `%cOverall Status: ${report.summary.allPassed ? "PASS ✓" : "FAIL ✗"} (${report.summary.passedTests}/${report.summary.totalTests})`,
        `font-weight: bold; font-size: 16px; color: ${report.summary.allPassed ? "#16a34a" : "#dc2626"}`,
      );

      return report;
    }
  }

  // Test cases for critical components
  const TEST_CASES = [
    {
      name: "Calculator Page Load",
      instructions:
        "Navigate to /calculators/framing/wall and run this test immediately",
      duration: 3000,
    },
    {
      name: "Modal Dialog Open/Close",
      instructions:
        "Navigate to /calculators/framing/wall, start test, then click Save or Estimate button to open modal",
      duration: 4000,
    },
    {
      name: "Animated Background",
      instructions: "Navigate to /calculators and run this test",
      duration: 5000,
    },
    {
      name: "Glass Card Hover Effects",
      instructions:
        "Navigate to /calculators, start test, then hover over calculator cards",
      duration: 5000,
    },
    {
      name: "Scrolling Performance",
      instructions:
        "Navigate to a page with scrollable content, start test, then scroll up and down",
      duration: 5000,
    },
  ];

  // Create global performance metrics instance
  window.glassPerformance = new PerformanceMetrics();

  // Add optimization testing functions
  window.glassOptimizations = {
    // Add will-change property to glass elements
    applyWillChange: () => {
      document
        .querySelectorAll(GLASS_SELECTOR)
        .forEach((el) => {
          el.style.willChange = "transform, opacity";
        });
      console.log("✅ Applied .glass-gpu-equivalent will-change to glass elements");
    },

    // Add translateZ to create compositor layers
    applyTranslateZ: () => {
      document
        .querySelectorAll(GLASS_SELECTOR)
        .forEach((el) => {
          el.style.transform = "translateZ(0)";
        });
      console.log("✅ Applied translateZ(0) to glass elements");
    },

    // Reduce backdrop filter complexity
    reduceBackdropFilterComplexity: () => {
      const style = document.createElement("style");
      style.textContent = `
        .backdrop-glass, .backdrop-glass-light, .backdrop-glass-heavy {
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }
      `;
      document.head.appendChild(style);
      console.log("✅ Reduced backdrop-filter complexity");
    },
  };

  // Print instructions
  console.log(
    "%c🧪 Liquid Orange Glass Performance Tester",
    `${HEADER_STYLE} font-size: 18px; background-color: #020617; padding: 5px;`,
  );
  console.log(
    "%cTest your UI components for iPhone 15 performance (target: <16.67ms per frame)",
    "font-size: 14px",
  );
  console.log("\nAvailable tests:");
  TEST_CASES.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}: ${test.instructions}`);
  });

  console.log("\nUsage:");
  console.log('1. glassPerformance.startTest("Test Name") - Start a new test');
  console.log("2. glassPerformance.endTest() - End the current test");
  console.log("3. glassPerformance.generateReport() - Generate a full report");

  console.log("\nOptimizations:");
  console.log(
    "1. glassOptimizations.applyWillChange() - Apply will-change optimization",
  );
  console.log(
    "2. glassOptimizations.applyTranslateZ() - Apply translateZ optimization",
  );
  console.log(
    "3. glassOptimizations.reduceBackdropFilterComplexity() - Reduce backdrop filter complexity",
  );
})();
