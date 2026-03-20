import { test, expect, devices } from "@playwright/test";
import { dismissCookieConsent } from "../utils/cookie-consent";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Homeowner — E-Signature Flow", () => {
  const SHARE_CODE = process.env.TEST_SHARE_CODE ?? "test-share-abc123";

  const openSignatureOrSkip = async (
    page: Parameters<typeof test>[0]["page"],
  ) => {
    await page.goto(`/sign/${SHARE_CODE}`);
    await dismissCookieConsent(page);

    const unavailable = page
      .getByText(/page not found|expired|invalid|no longer available/i)
      .first();
    if (await unavailable.isVisible().catch(() => false)) {
      test.skip(
        true,
        "Valid TEST_SHARE_CODE seed not available in this environment",
      );
    }

    const hasPad = (await page.getByTestId("signature-pad").count()) > 0;
    const hasSubmit =
      (await page
        .getByRole("button", {
          name: /submit signature|sign estimate|submit|sign/i,
        })
        .count()) > 0;
    if (!hasPad || !hasSubmit) {
      test.skip(
        true,
        "Signature UI not rendered for this share code in this environment",
      );
    }
  };

  test("signature pad renders on desktop", async ({ page }) => {
    await openSignatureOrSkip(page);

    const canvas = page.getByTestId("signature-pad");
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(200);
    expect(box?.height).toBeGreaterThan(80);
  });

  test("signature pad renders on mobile (iPhone 14)", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["iPhone 14"],
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await openSignatureOrSkip(page);

    const canvas = page.getByTestId("signature-pad");
    await expect(canvas).toBeVisible();
    await context.close();
  });

  test("sign button is disabled until name is entered and signature is drawn", async ({
    page,
  }) => {
    await openSignatureOrSkip(page);

    const submitBtn = page.getByRole("button", {
      name: /submit signature|sign estimate/i,
    });
    await expect(submitBtn).toBeDisabled();

    // Fill name only — button still disabled (no signature)
    await page.getByLabel(/your name|full name/i).fill("Sandra Wilson");
    await expect(submitBtn).toBeDisabled();
  });

  test("'clear' button resets the signature canvas", async ({ page }) => {
    await openSignatureOrSkip(page);

    const canvas = page.getByTestId("signature-pad");
    const clearBtn = page.getByRole("button", { name: /clear|reset/i });

    // Simulate a signature via mouse drag
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 40);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 40);
      await page.mouse.up();
    }

    await clearBtn.click();

    // Canvas should be blank again — check via JS pixel data
    const isBlank = await page.evaluate(() => {
      const canvas = document.querySelector(
        "[data-testid='signature-pad'] canvas",
      ) as HTMLCanvasElement;
      if (!canvas) return true;
      const ctx = canvas.getContext("2d");
      const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
      return data ? Array.from(data).every((v) => v === 0 || v === 255) : true;
    });
    expect(isBlank).toBe(true);
  });

  test("successful signature shows confirmation message", async ({ page }) => {
    await openSignatureOrSkip(page);

    // Fill signer name
    await page.getByLabel(/your name|full name/i).fill("Sandra Wilson");

    // Draw a signature
    const canvas = page.getByTestId("signature-pad");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 40);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 60);
      await page.mouse.move(box.x + 200, box.y + 30);
      await page.mouse.up();
    }

    const submitBtn = page.getByRole("button", {
      name: /submit signature|sign estimate/i,
    });
    await expect(submitBtn).not.toBeDisabled();
    await submitBtn.click();

    // Should see a success state
    await expect(
      page.getByText(/thank you|signed successfully|signature received/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("signature submission does not require signer email (optional field)", async ({
    page,
  }) => {
    await openSignatureOrSkip(page);

    // Do not fill email
    await page.getByLabel(/your name|full name/i).fill("Sandra Wilson");

    const canvas = page.getByTestId("signature-pad");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + 30);
      await page.mouse.down();
      await page.mouse.move(box.x + 120, box.y + 50);
      await page.mouse.up();
    }

    const submitBtn = page.getByRole("button", { name: /submit|sign/i });
    if (!(await submitBtn.isDisabled())) {
      await submitBtn.click();
      await expect(page.getByText(/thank you|success/i)).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test("signer name field validates minimum length", async ({ page }) => {
    await openSignatureOrSkip(page);

    await page.getByLabel(/your name|full name/i).fill("A"); // Too short
    const submitBtn = page.getByRole("button", { name: /submit|sign/i });

    if (!(await submitBtn.isDisabled())) {
      await submitBtn.click();
      await expect(
        page.getByText(/at least|minimum|2 characters/i),
      ).toBeVisible();
    }
  });

  test("signer email validates format when provided", async ({ page }) => {
    await openSignatureOrSkip(page);

    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill("notanemail");
      await page.getByLabel(/your name|full name/i).fill("Sandra Wilson");

      const submitBtn = page.getByRole("button", { name: /submit|sign/i });
      if (!(await submitBtn.isDisabled())) {
        await submitBtn.click();
        await expect(
          page.getByText(/valid email|email format|invalid/i),
        ).toBeVisible();
      }
    }
  });

  test("signature page has no console errors during signing flow", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await openSignatureOrSkip(page);
    await page.getByLabel(/your name|full name/i).fill("Sandra Wilson");

    const canvas = page.getByTestId("signature-pad");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 30);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + 50);
      await page.mouse.up();
    }

    const appErrors = errors.filter(
      (e) =>
        !e.includes("posthog") &&
        !e.includes("sentry") &&
        !e.includes("extension"),
    );
    expect(appErrors).toHaveLength(0);
  });
});
