# Pro Construction Calc — Playwright E2E Test Suite · Part 2

**Stakeholder Completion Package**
*Companion to: `PLAYWRIGHT-TEST-SUITE.md` (Part 1 — Contractor + Engineer)*
*Stack: Next.js 16 · Supabase · NextAuth 5 · Stripe · Playwright 1.58*

---

## Three Perspectives This Suite Covers

| # | Persona | Who They Are | Why They Can Kill Your Launch |
|---|---------|-------------|-------------------------------|
| 3 | 🏠 **The Homeowner / Client** | Receives a share link or PDF, no account | They are your word-of-mouth. A broken sign page = a lost referral |
| 4 | 🗂️ **The Office Manager / Admin** | Runs the back office, manages multiple jobs + contractors | They decide whether the company *keeps* the subscription |
| 5 | 💳 **The Subscription / Billing User** | Pays, upgrades, hits paywalls, cancels | Silent billing bugs are the #1 churn driver post-launch |

---

## How Part 2 Plugs Into Part 1

```
e2e/
├── [Part 1 — Contractor + Engineer]
│   ├── auth.setup.ts
│   ├── calculators/
│   ├── estimates/
│   ├── mobile/
│   ├── accessibility.spec.ts
│   ├── performance.spec.ts
│   ├── security.spec.ts
│   └── visual-regression.spec.ts
│
└── [Part 2 — Stakeholder Completion — ADD THESE]
    ├── homeowner/
    │   ├── share-link.spec.ts          # Public estimate view (no auth required)
    │   ├── signature.spec.ts           # Client e-signature flow
    │   └── pdf-readability.spec.ts     # PDF content assertions from a layperson's eyes
    │
    ├── office-manager/
    │   ├── command-center.spec.ts      # Dashboard: all jobs, all estimates
    │   ├── multi-user.spec.ts          # Two users, one org — data isolation + sharing
    │   ├── pricebook.spec.ts           # Shared materials/labor pricebook
    │   └── financial-dashboard.spec.ts # Revenue, job status, financial overview
    │
    └── billing/
        ├── subscription.spec.ts        # Free tier, upgrade, cancel, lapse
        ├── paywall.spec.ts             # Feature gating — graceful degradation
        ├── stripe-webhooks.spec.ts     # Webhook state simulation
        └── billing-edge-cases.spec.ts  # Retry, failed payment, grace period
```

---

## Perspective 3: 🏠 The Homeowner / Client

**Who is Sandra?**
Sandra is a homeowner in Utica who got a share link texted to her from Mike's office. She has never heard of Pro Construction Calc. She's on her iPhone SE, in her kitchen, using Safari. She doesn't have an account. She doesn't know what "CY" means. She needs to understand the estimate, feel like it's professional, and sign it without calling Mike to ask questions.

**What Sandra will break:**
- Share links that require an account to view
- Technical jargon on line items ("4000 PSI CY concrete" instead of "Concrete — 4-inch driveway slab")
- Signature pads that don't work on Safari iOS
- Estimates that time out before she finishes signing
- A "signed" confirmation that looks like a raw JSON response

---

### `homeowner/share-link.spec.ts`

```typescript
import { test, expect, devices } from "@playwright/test";

// The homeowner has NO account. Run against the no-auth project.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Homeowner — Public Estimate Share Link", () => {

  // Replace with a known test share code seeded in your test DB
  const SHARE_CODE = process.env.TEST_SHARE_CODE ?? "test-share-abc123";

  test("share link loads without requiring sign-in", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    // Should NOT redirect to auth
    await expect(page).not.toHaveURL(/auth\/signin|register/);
    await expect(page.getByText(/estimate|proposal|quote/i)).toBeVisible();
  });

  test("estimate shows contractor name prominently", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    // Contractor identity must be visible — this is a trust signal for the homeowner
    await expect(
      page.getByText(/contracting|construction|llc|inc/i).first()
    ).toBeVisible();
  });

  test("line items are visible and labeled in plain language", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    const lineItems = page.getByTestId("estimate-line-item");
    await expect(lineItems.first()).toBeVisible();

    // Line item should have a description, not just a code
    const firstDesc = await lineItems.first().textContent();
    expect(firstDesc?.trim().length).toBeGreaterThan(5);
    // Should NOT be raw codes like "CY" alone
    expect(firstDesc).not.toMatch(/^\s*(CY|SF|LF|EA)\s*$/);
  });

  test("total amount is displayed clearly with tax broken out", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    await expect(page.getByTestId("estimate-subtotal")).toBeVisible();
    await expect(page.getByTestId("estimate-tax")).toBeVisible();
    await expect(page.getByTestId("estimate-total")).toBeVisible();

    // Total should be in dollar format
    const totalText = await page.getByTestId("estimate-total").textContent();
    expect(totalText).toMatch(/\$[\d,]+(\.\d{2})?/);
  });

  test("invalid share code shows a friendly 404, not a crash", async ({ page }) => {
    await page.goto("/sign/this-code-does-not-exist-xyz999");

    await expect(page.getByText(/not found|expired|invalid|no longer available/i)).toBeVisible();
    await expect(page.getByText(/unhandled exception|application error|500/i)).not.toBeVisible();
  });

  test("share link loads correctly on iPhone SE viewport (320px)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/sign/${SHARE_CODE}`);

    // No horizontal scroll on smallest common phone
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(322);

    // Estimate content should still be visible
    await expect(page.getByTestId("estimate-total")).toBeVisible();
  });

  test("share link loads correctly on Safari-like WebKit", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["iPhone 14"],
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto(`/sign/${SHARE_CODE}`);

    await expect(page).not.toHaveURL(/auth\/signin/);
    await expect(page.getByText(/estimate|proposal/i)).toBeVisible();
    await context.close();
  });

  test("estimate page has a clear call-to-action to sign", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    const signBtn = page.getByRole("button", { name: /sign|approve|accept/i });
    await expect(signBtn).toBeVisible();

    // Button should be large enough to tap on mobile
    const box = await signBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test("already-signed estimate shows signed status, not the signature form again", async ({ page }) => {
    // Assumes a separate test share code for an already-signed estimate
    const SIGNED_CODE = process.env.TEST_SIGNED_SHARE_CODE;
    if (!SIGNED_CODE) test.skip();

    await page.goto(`/sign/${SIGNED_CODE}`);
    await expect(page.getByText(/signed|approved|completed/i)).toBeVisible();

    // The signature pad should NOT appear again
    const signatureCanvas = page.getByTestId("signature-pad");
    await expect(signatureCanvas).not.toBeVisible();
  });

});
```

---

### `homeowner/signature.spec.ts`

```typescript
import { test, expect, devices } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Homeowner — E-Signature Flow", () => {

  const SHARE_CODE = process.env.TEST_SHARE_CODE ?? "test-share-abc123";

  test("signature pad renders on desktop", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

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
    await page.goto(`/sign/${SHARE_CODE}`);

    const canvas = page.getByTestId("signature-pad");
    await expect(canvas).toBeVisible();
    await context.close();
  });

  test("sign button is disabled until name is entered and signature is drawn", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    const submitBtn = page.getByRole("button", { name: /submit signature|sign estimate/i });
    await expect(submitBtn).toBeDisabled();

    // Fill name only — button still disabled (no signature)
    await page.getByLabel(/your name|full name/i).fill("Sandra Wilson");
    await expect(submitBtn).toBeDisabled();
  });

  test("'clear' button resets the signature canvas", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

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
      const canvas = document.querySelector("[data-testid='signature-pad'] canvas") as HTMLCanvasElement;
      if (!canvas) return true;
      const ctx = canvas.getContext("2d");
      const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
      return data ? Array.from(data).every((v) => v === 0 || v === 255) : true;
    });
    expect(isBlank).toBe(true);
  });

  test("successful signature shows confirmation message", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

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

    const submitBtn = page.getByRole("button", { name: /submit signature|sign estimate/i });
    await expect(submitBtn).not.toBeDisabled();
    await submitBtn.click();

    // Should see a success state
    await expect(
      page.getByText(/thank you|signed successfully|signature received/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("signature submission does not require signer email (optional field)", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

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
      await expect(page.getByText(/thank you|success/i)).toBeVisible({ timeout: 10_000 });
    }
  });

  test("signer name field validates minimum length", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    await page.getByLabel(/your name|full name/i).fill("A"); // Too short
    const submitBtn = page.getByRole("button", { name: /submit|sign/i });

    if (!(await submitBtn.isDisabled())) {
      await submitBtn.click();
      await expect(page.getByText(/at least|minimum|2 characters/i)).toBeVisible();
    }
  });

  test("signer email validates format when provided", async ({ page }) => {
    await page.goto(`/sign/${SHARE_CODE}`);

    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill("notanemail");
      await page.getByLabel(/your name|full name/i).fill("Sandra Wilson");

      const submitBtn = page.getByRole("button", { name: /submit|sign/i });
      if (!(await submitBtn.isDisabled())) {
        await submitBtn.click();
        await expect(
          page.getByText(/valid email|email format|invalid/i)
        ).toBeVisible();
      }
    }
  });

  test("signature page has no console errors during signing flow", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(`/sign/${SHARE_CODE}`);
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
      (e) => !e.includes("posthog") && !e.includes("sentry") && !e.includes("extension")
    );
    expect(appErrors).toHaveLength(0);
  });

});
```

---

### `homeowner/pdf-readability.spec.ts`

> These tests assert the *content* of the PDF from a layperson's perspective — not just that a file downloaded, but that it contains what a homeowner needs to trust the document.

```typescript
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Note: PDF text extraction requires pdf-parse or a similar library in your test setup
// npm install pdf-parse --save-dev

test.describe("Homeowner — PDF Content & Readability", () => {

  const downloadDir = path.join(__dirname, "../.downloads");

  test.beforeAll(async () => {
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
  });

  test("PDF contains contractor contact information", async ({ page, context }) => {
    await context.grantPermissions([]);
    await page.goto("/cart");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /export pdf|download pdf/i }).click(),
    ]);

    const filePath = path.join(downloadDir, "estimate-test.pdf");
    await download.saveAs(filePath);

    // Verify file exists and has content
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(10_000); // At least 10KB — not an empty file

    // Clean up
    fs.unlinkSync(filePath);
  });

  test("PDF filename reflects the estimate context", async ({ page }) => {
    await page.goto("/cart");

    const pdfBtn = page.getByRole("button", { name: /export pdf|download pdf/i });
    if (await pdfBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfBtn.click(),
      ]);

      const filename = download.suggestedFilename();
      // Should not be generic — should contain date or job name
      expect(filename).toMatch(/estimate|proposal|calc|job/i);
      expect(filename).not.toBe("download.pdf");
      expect(filename).not.toBe("file.pdf");
      expect(filename).toMatch(/\.pdf$/i);
    }
  });

  test("PDF generation does not produce a zero-byte file", async ({ page }) => {
    await page.goto("/cart");

    const pdfBtn = page.getByRole("button", { name: /export pdf|download pdf/i });
    if (await pdfBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfBtn.click(),
      ]);

      const filePath = path.join(downloadDir, "zero-byte-test.pdf");
      await download.saveAs(filePath);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
      fs.unlinkSync(filePath);
    }
  });

  test("invoice generation works from saved estimate", async ({ page }) => {
    await page.goto("/saved");
    const firstEstimate = page.getByTestId("saved-estimate").first();

    if (await firstEstimate.isVisible()) {
      await firstEstimate.click();
      await page.waitForURL(/saved\//);

      const invoiceBtn = page.getByRole("button", { name: /invoice|generate invoice/i });
      if (await invoiceBtn.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          invoiceBtn.click(),
        ]);
        expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf$/i);
      }
    }
  });

});
```

---

## Perspective 4: 🗂️ The Office Manager / Admin

**Who is Donna?**
Donna has worked for Oneida Valley Contracting for 11 years. She handles billing, schedules, and makes sure the right estimate goes to the right job. She doesn't run the calculators herself — she reviews what the crew saves, organizes it by job, exports invoices, and is the one who decides in January whether to renew the subscription. If the Command Center is confusing or she can't find a job, the contractor goes back to HCP.

**What Donna will break:**
- A "saved estimates" list with no search or filter
- Estimates that don't show which crew member created them
- No way to distinguish "pending signature" from "signed" estimates
- A financial dashboard that doesn't load or shows stale data
- Multi-user flows where one user accidentally overwrites another's work

---

### `office-manager/command-center.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Office Manager — Command Center Dashboard", () => {

  test("command center loads without error for authenticated user", async ({ page }) => {
    await page.goto("/command-center");
    await expect(page).not.toHaveURL(/auth\/signin/);
    await expect(page.getByRole("heading", { name: /command center|dashboard/i })).toBeVisible();
  });

  test("all saved estimates are listed in command center", async ({ page }) => {
    await page.goto("/command-center");

    const estimateList = page.getByTestId("estimate-list-item");
    // Should display estimates, not an empty broken state
    const count = await estimateList.count();
    // If there are any saved estimates, they should show up
    if (count === 0) {
      await expect(page.getByText(/no estimates|get started|create your first/i)).toBeVisible();
    } else {
      await expect(estimateList.first()).toBeVisible();
    }
  });

  test("estimates can be filtered by status (signed vs. pending)", async ({ page }) => {
    await page.goto("/command-center");

    const statusFilter = page.getByLabel(/status|filter/i).first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption(/signed|approved/i);
      // List should update
      await page.waitForTimeout(500);
      const items = page.getByTestId("estimate-list-item");
      const count = await items.count();
      // All visible items should be "signed" status
      if (count > 0) {
        const statusBadge = items.first().getByTestId("estimate-status");
        const badgeText = await statusBadge.textContent();
        expect(badgeText).toMatch(/signed|approved/i);
      }
    }
  });

  test("estimates can be searched by job name or client name", async ({ page }) => {
    await page.goto("/command-center");

    const searchInput = page.getByPlaceholder(/search|find estimate/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Johnson");
      await page.waitForTimeout(400); // debounce

      const items = page.getByTestId("estimate-list-item");
      const count = await items.count();
      if (count > 0) {
        const firstText = await items.first().textContent();
        expect(firstText?.toLowerCase()).toContain("johnson");
      }
    }
  });

  test("estimate list shows date created and total value", async ({ page }) => {
    await page.goto("/command-center");

    const firstItem = page.getByTestId("estimate-list-item").first();
    if (await firstItem.isVisible()) {
      // Should show a date
      const dateEl = firstItem.getByTestId("estimate-date");
      if (await dateEl.isVisible()) {
        const dateText = await dateEl.textContent();
        expect(dateText).toMatch(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i);
      }

      // Should show a dollar total
      const totalEl = firstItem.getByTestId("estimate-total");
      if (await totalEl.isVisible()) {
        const totalText = await totalEl.textContent();
        expect(totalText).toMatch(/\$/);
      }
    }
  });

  test("clicking an estimate row opens the full estimate detail", async ({ page }) => {
    await page.goto("/command-center");

    const firstItem = page.getByTestId("estimate-list-item").first();
    if (await firstItem.isVisible()) {
      await firstItem.click();
      await expect(page).toHaveURL(/saved\/|estimate\//);
      await expect(page.getByTestId("cart-item").first()).toBeVisible();
    }
  });

  test("command center shows financial summary totals", async ({ page }) => {
    await page.goto("/command-center");

    // Financial summary widgets
    const summaryWidgets = page.getByTestId("financial-summary-widget");
    if (await summaryWidgets.first().isVisible()) {
      // Should show dollar amounts, not loading spinners
      await expect(page.getByTestId("loading-spinner")).not.toBeVisible({ timeout: 5000 });
      const widgetText = await summaryWidgets.first().textContent();
      expect(widgetText).toMatch(/\$|%/);
    }
  });

  test("command center loads within 3 seconds on first visit", async ({ page }) => {
    const start = Date.now();
    await page.goto("/command-center");
    await page.waitForLoadState("networkidle");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

});
```

---

### `office-manager/multi-user.spec.ts`

> These tests require **two separate test accounts** in your Supabase test DB. They verify that data isolation holds across users.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Office Manager — Multi-User Data Isolation", () => {

  test.skip(!process.env.TEST_USER_2_EMAIL, "Requires second test account");

  test("User A's estimates are not visible in User B's command center", async ({ browser }) => {
    // User A session
    const ctxA = await browser.newContext({
      storageState: "e2e/.auth/user.json",
    });
    const pageA = await ctxA.newPage();

    // Create a uniquely named estimate as User A
    const uniqueTitle = `UserA-Only-${Date.now()}`;
    await pageA.goto("/cart");
    const saveBtn = pageA.getByRole("button", { name: /save estimate/i });
    if (await saveBtn.isVisible()) {
      const nameInput = pageA.getByLabel(/estimate name|title/i);
      if (await nameInput.isVisible()) await nameInput.fill(uniqueTitle);
      await saveBtn.click();
    }
    await ctxA.close();

    // User B session — log in separately
    const ctxB = await browser.newContext({
      storageState: "e2e/.auth/user2.json", // Second test account
    });
    const pageB = await ctxB.newPage();

    await pageB.goto("/command-center");
    // User B should NOT see User A's estimate
    await expect(pageB.getByText(uniqueTitle)).not.toBeVisible();
    await ctxB.close();
  });

  test("User A cannot access User B's estimate by direct URL", async ({ browser }) => {
    // This test requires knowing a saved estimate ID belonging to User B
    const estimateId = process.env.TEST_USER_2_ESTIMATE_ID;
    if (!estimateId) test.skip();

    const ctxA = await browser.newContext({
      storageState: "e2e/.auth/user.json",
    });
    const pageA = await ctxA.newPage();

    await pageA.goto(`/saved/${estimateId}`);

    // Should get 403, 404, or redirect — NOT the estimate content
    const url = pageA.url();
    const is403 = await pageA.getByText(/unauthorized|forbidden|not found/i).isVisible();
    const isRedirected = url.includes("signin") || url.includes("unauthorized");

    expect(is403 || isRedirected).toBe(true);
    await ctxA.close();
  });

  test("share link generated by User A is accessible by User B", async ({ browser }) => {
    // Shared estimates ARE intended to cross user boundaries — verify this works
    const SHARE_CODE = process.env.TEST_SHARE_CODE;
    if (!SHARE_CODE) test.skip();

    const ctxB = await browser.newContext({
      storageState: "e2e/.auth/user2.json",
    });
    const pageB = await ctxB.newPage();

    await pageB.goto(`/sign/${SHARE_CODE}`);
    await expect(pageB.getByText(/estimate|proposal/i)).toBeVisible();
    await ctxB.close();
  });

  test("share link is accessible with NO account (public access)", async ({ browser }) => {
    const SHARE_CODE = process.env.TEST_SHARE_CODE;
    if (!SHARE_CODE) test.skip();

    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();

    await page.goto(`/sign/${SHARE_CODE}`);
    await expect(page).not.toHaveURL(/signin/);
    await expect(page.getByText(/estimate|proposal/i)).toBeVisible();
    await ctx.close();
  });

});
```

---

### `office-manager/pricebook.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Office Manager — Pricebook", () => {

  test("pricebook page loads for authenticated user", async ({ page }) => {
    await page.goto("/pricebook");
    await expect(page).not.toHaveURL(/signin/);
    await expect(page.getByRole("heading", { name: /pricebook|materials|pricing/i })).toBeVisible();
  });

  test("pricebook entries are listed", async ({ page }) => {
    await page.goto("/pricebook");
    const entries = page.getByTestId("pricebook-entry");

    if (await entries.count() === 0) {
      await expect(page.getByText(/no items|add your first|empty/i)).toBeVisible();
    } else {
      await expect(entries.first()).toBeVisible();
    }
  });

  test("new material can be added to pricebook", async ({ page }) => {
    await page.goto("/pricebook");

    const addBtn = page.getByRole("button", { name: /add|new item|create/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();

      const itemName = `Test Material ${Date.now()}`;
      await page.getByLabel(/name|material/i).fill(itemName);
      await page.getByLabel(/price|cost|unit price/i).fill("4.75");
      await page.getByLabel(/unit/i).fill("SF");
      await page.getByRole("button", { name: /save|add|confirm/i }).click();

      await expect(page.getByText(itemName)).toBeVisible();
    }
  });

  test("pricebook entry price accepts two decimal places only", async ({ page }) => {
    await page.goto("/pricebook");

    const addBtn = page.getByRole("button", { name: /add|new item/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const priceInput = page.getByLabel(/price|cost/i);
      await priceInput.fill("4.7599");

      await page.getByRole("button", { name: /save|confirm/i }).click();

      // Should normalize to 2 decimal places
      const savedPrice = await page.getByTestId("pricebook-entry").last().textContent();
      expect(savedPrice).not.toContain("4.7599");
    }
  });

  test("pricebook item can be deleted", async ({ page }) => {
    await page.goto("/pricebook");

    const entries = page.getByTestId("pricebook-entry");
    const count = await entries.count();

    if (count > 0) {
      await entries.last().getByRole("button", { name: /delete|remove/i }).click();

      const confirmBtn = page.getByRole("button", { name: /confirm|yes/i });
      if (await confirmBtn.isVisible()) await confirmBtn.click();

      await expect(entries).toHaveCount(count - 1);
    }
  });

});
```

---

### `office-manager/financial-dashboard.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Office Manager — Financial Dashboard", () => {

  test("financial dashboard is accessible to authenticated user", async ({ page }) => {
    await page.goto("/command-center");

    const finTab = page.getByRole("tab", { name: /financial|finance|revenue/i });
    if (await finTab.isVisible()) {
      await finTab.click();
      await expect(page).not.toHaveURL(/signin/);
    }
  });

  test("financial data loads without infinite spinner", async ({ page }) => {
    await page.goto("/command-center");

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    const spinner = page.getByTestId("loading-spinner");
    // Spinner should not persist after network idle
    await expect(spinner).not.toBeVisible({ timeout: 5000 });
  });

  test("revenue figures display as currency, not raw numbers", async ({ page }) => {
    await page.goto("/command-center");
    await page.waitForLoadState("networkidle");

    const revenueEl = page.getByTestId("total-revenue");
    if (await revenueEl.isVisible()) {
      const text = await revenueEl.textContent();
      // Should be formatted as currency
      expect(text).toMatch(/\$[\d,]+/);
    }
  });

  test("financial dashboard shows month and year-to-date totals", async ({ page }) => {
    await page.goto("/command-center");
    await page.waitForLoadState("networkidle");

    const mtd = page.getByTestId("revenue-mtd");
    const ytd = page.getByTestId("revenue-ytd");

    if (await mtd.isVisible()) {
      await expect(mtd).toBeVisible();
    }
    if (await ytd.isVisible()) {
      await expect(ytd).toBeVisible();
    }
  });

  test("estimate count badge updates after new estimate is saved", async ({ page }) => {
    await page.goto("/command-center");

    const countEl = page.getByTestId("total-estimate-count");
    const before = parseInt((await countEl.textContent()) ?? "0");

    // Save a new estimate
    await page.goto("/cart");
    const saveBtn = page.getByRole("button", { name: /save estimate/i });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.goto("/command-center");
      const after = parseInt((await countEl.textContent()) ?? "0");
      expect(after).toBeGreaterThanOrEqual(before);
    }
  });

});
```

---

## Perspective 5: 💳 The Subscription / Billing User

**Who is the Billing User?**
This isn't a single persona — it's every user at the moment they hit a paywall, try to upgrade, forget to pay, or want to cancel. You have Stripe in the stack. The billing layer is invisible until it breaks, and when it breaks it either loses a customer or charges one incorrectly. Both are catastrophic.

**What billing bugs look like in the wild:**
- Free user sees premium features briefly (then gets 500 error when they try to use them)
- Paid user gets downgraded after a webhook arrives out of order
- Canceled user still gets charged the next month
- Upgrade flow redirects to Stripe but returns to a broken callback URL
- Failed payment doesn't degrade gracefully — it just locks the user out with no explanation

---

### `billing/paywall.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Billing — Free Tier Paywall Behavior", () => {

  // Run with a test account that is on the FREE tier
  test.use({ storageState: "e2e/.auth/free-user.json" });

  test("free user sees upgrade prompt, not a 500 error, on premium feature", async ({ page }) => {
    await page.goto("/command-center");

    // Try to access a premium feature — e.g., financial dashboard
    const premiumFeature = page.getByTestId("premium-feature");
    if (await premiumFeature.isVisible()) {
      await premiumFeature.click();

      // Should show upgrade prompt
      await expect(
        page.getByText(/upgrade|pro plan|unlock|subscription required/i)
      ).toBeVisible({ timeout: 3000 });

      // Should NOT show a 500 or crash
      await expect(page.getByText(/error|500|unhandled/i)).not.toBeVisible();
    }
  });

  test("free user can still use all calculators", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    // Core calculators should be available on free tier
    await expect(page.getByLabel(/length/i)).toBeVisible();
    await page.getByLabel(/length/i).fill("20");
    await page.getByLabel(/width/i).fill("24");
    await page.getByLabel(/thickness/i).fill("4");
    await page.getByRole("button", { name: /calculate/i }).click();
    await expect(page.getByTestId("calc-result")).toBeVisible();
  });

  test("upgrade CTA is visible and prominent on free tier", async ({ page }) => {
    await page.goto("/command-center");

    const upgradeCTA = page.getByRole("button", { name: /upgrade|go pro|subscribe/i })
      .or(page.getByRole("link", { name: /upgrade|go pro|subscribe/i }));

    await expect(upgradeCTA.first()).toBeVisible();
  });

  test("paywall modal has a working 'upgrade' link that goes to Stripe or /subscribe", async ({ page }) => {
    await page.goto("/command-center");

    const premiumFeature = page.getByTestId("premium-feature");
    if (await premiumFeature.isVisible()) {
      await premiumFeature.click();

      const upgradeBtn = page.getByRole("button", { name: /upgrade now|subscribe/i })
        .or(page.getByRole("link", { name: /upgrade now|subscribe/i }));

      if (await upgradeBtn.isVisible()) {
        const [newPage] = await Promise.all([
          page.context().waitForEvent("page").catch(() => null),
          upgradeBtn.click(),
        ]);

        // Should navigate to Stripe checkout or internal /subscribe page
        const currentUrl = newPage ? newPage.url() : page.url();
        expect(currentUrl).toMatch(/stripe\.com|checkout|subscribe|billing/i);
      }
    }
  });

  test("feature limit message explains what they'd get by upgrading", async ({ page }) => {
    await page.goto("/command-center");

    const premiumFeature = page.getByTestId("premium-feature");
    if (await premiumFeature.isVisible()) {
      await premiumFeature.click();

      // Message should explain the value, not just say "no"
      const message = await page.getByTestId("paywall-message").textContent();
      if (message) {
        expect(message.length).toBeGreaterThan(20);
        expect(message).not.toMatch(/^(locked|no access|forbidden)\.?$/i);
      }
    }
  });

});
```

---

### `billing/subscription.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Billing — Subscription State Management", () => {

  test("subscription status is displayed in settings", async ({ page }) => {
    await page.goto("/settings");

    const billingSection = page.getByTestId("billing-section")
      .or(page.getByText(/subscription|plan|billing/i).first());

    await expect(billingSection).toBeVisible();
  });

  test("active subscriber sees 'Pro' or plan name, not free tier UI", async ({ page }) => {
    await page.goto("/settings");

    // Should NOT see upgrade prompt if already subscribed
    await expect(
      page.getByRole("button", { name: /upgrade|go pro/i })
    ).not.toBeVisible();

    // Should see plan status
    await expect(
      page.getByText(/pro|active|subscribed|current plan/i)
    ).toBeVisible();
  });

  test("manage subscription link navigates to Stripe customer portal", async ({ page }) => {
    await page.goto("/settings");

    const manageBtn = page.getByRole("button", { name: /manage subscription|billing portal/i })
      .or(page.getByRole("link", { name: /manage subscription|billing portal/i }));

    if (await manageBtn.isVisible()) {
      const [newPageOrRedirect] = await Promise.all([
        page.context().waitForEvent("page").catch(() => page),
        manageBtn.click(),
      ]);

      const targetUrl = newPageOrRedirect instanceof Object && "url" in newPageOrRedirect
        ? newPageOrRedirect.url()
        : page.url();

      expect(targetUrl).toMatch(/stripe\.com|billing|portal/i);
    }
  });

  test("subscription status loads without a page-level error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    expect(errors.filter((e) => !e.includes("extension"))).toHaveLength(0);
  });

});
```

---

### `billing/paywall-edge-cases.spec.ts`

> These tests simulate Stripe webhook states. In a real CI environment, use Stripe's test clock feature or a mock webhook endpoint.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Billing — Edge Cases & State Transitions", () => {

  test("lapsed subscription shows grace period message, not immediate lockout", async ({ page }) => {
    // Use a test account in 'past_due' Stripe state
    const LAPSED_AUTH = process.env.TEST_LAPSED_USER_AUTH;
    if (!LAPSED_AUTH) test.skip();

    await page.goto("/command-center");
    await page.waitForLoadState("networkidle");

    // Should NOT be completely locked out
    await expect(page).not.toHaveURL(/signin/);

    // Should show a payment warning banner
    await expect(
      page.getByText(/payment failed|past due|update payment|subscription issue/i)
    ).toBeVisible();
  });

  test("payment failure banner has a clear 'update payment' link", async ({ page }) => {
    const LAPSED_AUTH = process.env.TEST_LAPSED_USER_AUTH;
    if (!LAPSED_AUTH) test.skip();

    await page.goto("/command-center");

    const updateBtn = page.getByRole("button", { name: /update payment|fix billing|retry/i })
      .or(page.getByRole("link", { name: /update payment|fix billing|retry/i }));

    await expect(updateBtn.first()).toBeVisible({ timeout: 5000 });
  });

  test("API routes return 402 for features gated behind active subscription", async ({ request }) => {
    // Use a session cookie from a free-tier user
    const freeCookie = process.env.TEST_FREE_USER_COOKIE;
    if (!freeCookie) test.skip();

    const response = await request.get("/api/command-center/financial", {
      headers: { Cookie: freeCookie },
    });

    expect([402, 403, 200]).toContain(response.status());
    // If 200, verify the body doesn't contain real financial data
  });

  test("Stripe checkout success callback redirects to app correctly", async ({ page }) => {
    // Simulate a Stripe return URL — Stripe appends ?session_id= on success
    await page.goto("/billing/success?session_id=cs_test_simulated_123");

    // Should land on a success confirmation page, not 404 or error
    await expect(page).not.toHaveURL(/404|error/);
    await expect(
      page.getByText(/subscription active|welcome|thank you|upgraded/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("Stripe checkout cancel callback returns user to pricing page", async ({ page }) => {
    await page.goto("/billing/cancel");

    // User canceled — should land back in the app, not an error
    await expect(page).not.toHaveURL(/404|error|crash/);
    await expect(
      page.getByText(/pricing|subscribe|plan|upgrade/i)
    ).toBeVisible();
  });

  test("webhook endpoint returns 200 for valid Stripe events", async ({ request }) => {
    // Stripe sends POST to /api/webhooks/stripe (or similar)
    const response = await request.post("/api/webhooks/stripe", {
      data: {
        type: "customer.subscription.updated",
        data: { object: { status: "active" } },
      },
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=invalid,v1=invalid", // Will fail sig check — expect 400, NOT 500
      },
    });

    // Should reject bad signature gracefully — 400, not 500
    expect(response.status()).toBeLessThan(500);
  });

});
```

---

## Combined Beta Exit Checklist (Parts 1 + 2)

This is your full stakeholder sign-off table. Every row must be green before removing the beta label.

### Part 1 — Contractor + Engineer (from PLAYWRIGHT-TEST-SUITE.md)

| Area | Contractor Gate | Engineer Gate | Status |
|------|----------------|---------------|--------|
| Sign in / 2FA | Signs in from iPhone in <10s | Session token stored correctly | ⬜ |
| Slab calc accuracy | CY matches hand calc ±0.1 | No NaN/undefined in output | ⬜ |
| Stud count | Integer result, correct OC math | Whole-number rounding enforced | ⬜ |
| Roofing bundles | Waste factor adds correctly | Pitch multiplier applied | ⬜ |
| Business margin | 20% margin on $10k job correct | Negative margin shown, not crashed | ⬜ |
| Regional tax | Oneida defaults to 8.75% | Custom rate overrides default | ⬜ |
| Cart persistence | Survives page refresh | Not shared across sessions | ⬜ |
| PDF export | Downloads in <15s | Meaningful filename, not "download.pdf" | ⬜ |
| Saved estimates | Can save and reopen next day | Data isolated per user | ⬜ |
| Mobile layout | No horizontal scroll on Pixel 7 | Touch targets ≥44px | ⬜ |
| Offline fallback | Offline page shows, no crash | SW registers on first load | ⬜ |
| Auth gates | N/A | All protected routes require session | ⬜ |
| Keyboard nav | N/A | Full calc operable by Tab+Enter | ⬜ |
| Load speed | Calc result in <500ms | LCP <2.5s, no hydration errors | ⬜ |

### Part 2 — Homeowner, Office Manager, Billing (NEW)

| Area | Test File | Gate | Status |
|------|-----------|------|--------|
| Share link loads without auth | `share-link.spec.ts` | No login required, renders on iPhone SE 320px | ⬜ |
| Share link shows professional info | `share-link.spec.ts` | Contractor name + dollar total visible | ⬜ |
| Invalid share code = friendly 404 | `share-link.spec.ts` | No crash, no raw error JSON | ⬜ |
| Signature pad renders (mobile) | `signature.spec.ts` | Renders on iPhone 14 Safari | ⬜ |
| Sign button disabled until complete | `signature.spec.ts` | Name + drawn signature required | ⬜ |
| Successful sign shows confirmation | `signature.spec.ts` | "Thank you" or success state visible | ⬜ |
| Already-signed estimate locked | `signature.spec.ts` | Pad hidden, status shown | ⬜ |
| PDF filename meaningful | `pdf-readability.spec.ts` | Not "download.pdf", contains context | ⬜ |
| PDF not zero-byte | `pdf-readability.spec.ts` | File > 10KB | ⬜ |
| Command center loads | `command-center.spec.ts` | Loads in <3s, no spinner persists | ⬜ |
| Estimate list sortable/filterable | `command-center.spec.ts` | Status filter works, signed vs. pending | ⬜ |
| Estimate search works | `command-center.spec.ts` | Search by job/client name returns results | ⬜ |
| Cross-user data isolation | `multi-user.spec.ts` | User A's estimates invisible to User B | ⬜ |
| Direct URL isolation | `multi-user.spec.ts` | User A can't open User B's estimate by ID | ⬜ |
| Pricebook CRUD | `pricebook.spec.ts` | Add, list, delete entries | ⬜ |
| Free tier can use calculators | `paywall.spec.ts` | All calcs work on free plan | ⬜ |
| Free tier paywall = upgrade CTA | `paywall.spec.ts` | Prompt shows, no 500 error | ⬜ |
| Upgrade CTA goes to Stripe | `paywall.spec.ts` | Navigates to Stripe checkout or /subscribe | ⬜ |
| Lapsed sub = grace warning, not lockout | `paywall-edge-cases.spec.ts` | Warning banner shown, not immediate logout | ⬜ |
| Stripe success callback works | `paywall-edge-cases.spec.ts` | Lands on confirmation page | ⬜ |
| Stripe cancel callback works | `paywall-edge-cases.spec.ts` | Returns to pricing, not 404 | ⬜ |
| Bad webhook signature = 400 not 500 | `paywall-edge-cases.spec.ts` | No 5xx on invalid Stripe signature | ⬜ |

---

## Additional Environment Variables for Part 2

Add these to your `.env.test` alongside the Part 1 variables:

```bash
# Part 2 — Additional test accounts
TEST_2FA_EMAIL=2fa-test@contractor.test
TEST_2FA_PASSWORD=TestPass2FA!
TEST_USER_2_EMAIL=office-manager@contractor.test
TEST_USER_2_PASSWORD=TestPass456!
TEST_USER_2_ESTIMATE_ID=uuid-of-estimate-owned-by-user-2

# Public-facing share links
TEST_SHARE_CODE=test-share-abc123          # Unsigned estimate
TEST_SIGNED_SHARE_CODE=test-signed-xyz789  # Already-signed estimate

# Billing test states
TEST_FREE_USER_AUTH=e2e/.auth/free-user.json
TEST_LAPSED_USER_AUTH=e2e/.auth/lapsed-user.json
TEST_FREE_USER_COOKIE=next-auth.session-token=...
```

## Seeding Test Data

For a full run in CI, you'll want a seed script that creates:

```
scripts/seed-test-data.ts
├── User A (contractor) — standard paid account, 3+ saved estimates
├── User B (office manager) — standard paid account, separate org
├── Free User — free tier account, 0 saved estimates
├── 2FA User — paid account with 2FA enabled
├── Lapsed User — past_due Stripe subscription state
├── Test Share Code — unsigned public estimate
└── Signed Share Code — already-signed public estimate
```

---

*Pro Construction Calc · Playwright E2E Test Suite · Part 2: Stakeholder Completion Package · v1.0 · March 2026*
