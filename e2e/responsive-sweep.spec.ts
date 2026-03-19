import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile-sm", width: 320, height: 568 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet-sm", width: 600, height: 800 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "tablet-landscape", width: 1112, height: 834 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "large", width: 1920, height: 1080 },
] as const;

const PATHS = [
  "/",
  "/calculators",
  "/guide",
  "/field-notes",
  "/faq",
  "/contact",
  "/cart",
  "/offline",
] as const;

test.describe("Responsive UI Sweep", () => {
  for (const viewport of VIEWPORTS) {
    test(`core routes render safely at ${viewport.name}`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const path of PATHS) {
        const response = await page.goto(path, {
          waitUntil: "domcontentloaded",
        });

        expect(response && response.status()).toBeLessThan(400);

        const hasVisibleMainOrBodyContent = await page.evaluate(() => {
          const isVisible = (el: Element | null): boolean => {
            if (!el) return false;
            const styles = window.getComputedStyle(el);
            if (styles.display === "none" || styles.visibility === "hidden") {
              return false;
            }
            const rect = (el as HTMLElement).getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          };

          const mainNodes = Array.from(
            document.querySelectorAll("main, [role='main'], #main-content"),
          );

          if (mainNodes.some((node) => isVisible(node))) {
            return true;
          }

          return (document.body?.innerText.trim().length ?? 0) > 0;
        });

        expect(hasVisibleMainOrBodyContent).toBeTruthy();

        const overflowMetrics = await page.evaluate(() => ({
          innerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));

        expect(overflowMetrics.scrollWidth).toBeLessThanOrEqual(
          overflowMetrics.innerWidth + 2,
        );

        const scrollability = await page.evaluate(() => {
          const root = document.scrollingElement ?? document.documentElement;
          const rootNeedsScroll = root.scrollHeight > root.clientHeight + 1;
          const rootStart = root.scrollTop;

          if (rootNeedsScroll) {
            root.scrollTop = root.scrollHeight;
            const rootMoved = root.scrollTop > rootStart;
            root.scrollTop = rootStart;
            if (rootMoved) {
              return { scrollNeeded: true, canScroll: true };
            }
          }

          const main =
            document.querySelector<HTMLElement>("main") ||
            document.querySelector<HTMLElement>("[role='main']");

          if (!main) {
            return { scrollNeeded: false, canScroll: true };
          }

          const mainNeedsScroll = main.scrollHeight > main.clientHeight + 1;
          if (!mainNeedsScroll) {
            return { scrollNeeded: false, canScroll: true };
          }

          const mainStart = main.scrollTop;
          main.scrollTop = main.scrollHeight;
          const mainMoved = main.scrollTop > mainStart;
          main.scrollTop = mainStart;

          return { scrollNeeded: true, canScroll: mainMoved };
        });

        if (scrollability.scrollNeeded) {
          expect(scrollability.canScroll).toBeTruthy();
        }
      }
    });
  }

  test("mobile primary actions are thumb-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const visibleAction = page.getByRole("link", {
      name: /start new estimate/i,
    });

    await expect(visibleAction).toBeVisible();

    const box = await visibleAction.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
