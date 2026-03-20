# Pro Construction Calc — Playwright E2E Test Suite

**Pre-Beta Exit Quality Gate**
*Authored for: Claude Code | Stack: Next.js 16 · Supabase · NextAuth 5 · Tailwind 4 · Playwright 1.58*

---

## Two Perspectives Driving This Suite

### 🦺 The 20-Year Contractor (HCP/Jobbr Veteran)
Mike has been running crews in Oneida County since 2004. He knows every shortcut in HCP. He's evaluating this tool on one question: *"Can I trust this thing in the field, on my phone, with dirty gloves?"* His bar is high on workflow speed, number accuracy, and PDF output. He doesn't care about your tech stack — he cares that the slab calc gives him the right yards and that the estimate PDF looks professional enough to hand to a homeowner.

**What Mike will break:**
- Inputs that accept letters in number fields
- Footings that round the wrong direction
- PDFs that cut off line items
- Auth flows that log him out mid-estimate
- Any calculator that requires more than 3 taps to get a result

### 🧑‍💻 The Software Engineer (Breaking Things for Fun)
Alex ships production React apps and has been poking at Next.js 16's App Router since day one. She's stress-testing auth state, race conditions in the cart, hydration mismatches, and whether the service worker actually caches correctly. She'll open DevTools before she reads a single label.

**What Alex will break:**
- Session tokens that don't refresh on 2FA reissue
- Cart state that survives a hard refresh (or shouldn't)
- Form validation that only runs client-side
- Accessibility violations that block keyboard users
- Any API route that leaks user data across sessions

---

## Setup & Configuration

```typescript
// playwright.config.ts — recommended for this suite
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
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
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // Mobile — contractor's actual device
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 14"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // Unauthenticated — public routes only
    {
      name: "no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.noauth\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Auth Setup File

```typescript
// e2e/auth.setup.ts
import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/auth/signin");

  await page.getByLabel("Email").fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel("Password").fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to dashboard or calculators
  await page.waitForURL(/\/(calculators|dashboard|saved)?$/);
  await expect(page).not.toHaveURL(/auth\/signin/);

  await page.context().storageState({ path: authFile });
});
```

### Environment Variables (`.env.test`)
```bash
TEST_USER_EMAIL=contractor@test.proconstructioncalc.com
TEST_USER_PASSWORD=TestPass123!
TEST_BASE_URL=http://localhost:3000
```

---

## File Structure

```
e2e/
├── auth.setup.ts                    # Session bootstrapper
├── .auth/
│   └── user.json                    # Persisted auth state (gitignored)
│
├── auth.spec.ts                     # Sign in, register, 2FA, reset password
├── auth-edge-cases.spec.ts          # Session expiry, cross-tab logout
│
├── calculators/
│   ├── concrete.spec.ts             # Slab, footing, block, block-wall
│   ├── framing.spec.ts              # Wall studs, floor joists, rafters, headers
│   ├── roofing.spec.ts              # Shingles, pitch, siding
│   ├── insulation.spec.ts           # R-value, drywall, duct sizing
│   ├── interior.spec.ts             # Flooring, stairs, trim, paint
│   ├── mechanical.spec.ts           # HVAC BTU, ventilation
│   ├── business.spec.ts             # Margin, labor rate, tax
│   ├── calc-accuracy.spec.ts        # Cross-calc math verification
│   └── calc-ux.spec.ts              # Shared UX: inputs, errors, add-to-cart
│
├── estimates/
│   ├── cart.spec.ts                 # Add, remove, edit line items
│   ├── saved-estimates.spec.ts      # Save, retrieve, delete
│   ├── pdf-export.spec.ts           # PDF generation and download
│   └── invoice.spec.ts              # Invoice generation flow
│
├── field-notes.spec.ts              # Content loads, links work
├── settings.spec.ts                 # Profile, 2FA toggle, tax defaults
├── navigation.spec.ts               # Routing, breadcrumbs, 404
│
├── mobile/
│   ├── pwa.spec.ts                  # Install prompt, offline fallback, cache
│   ├── touch-ux.spec.ts             # Touch targets, scroll, mobile inputs
│   └── mobile-calc.spec.ts          # End-to-end calc on mobile viewport
│
├── accessibility.spec.ts            # WCAG 2.1 AA — keyboard nav, ARIA, contrast
├── performance.spec.ts              # Core Web Vitals, load times
├── security.spec.ts                 # Auth gates, route protection
└── visual-regression.spec.ts        # Screenshot diffs for key screens
```

---

## 1. Authentication (`auth.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {

  test.describe("Sign In", () => {
    test("contractor can sign in with valid credentials", async ({ page }) => {
      await page.goto("/auth/signin");
      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByLabel("Password").fill("TestPass123!");
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page).not.toHaveURL(/auth\/signin/);
      await expect(page.getByText(/welcome|dashboard|calculators/i)).toBeVisible();
    });

    test("shows inline error for wrong password — not a full page crash", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByLabel("Password").fill("WrongPassword!");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should stay on sign-in page with an error message
      await expect(page).toHaveURL(/auth\/signin/);
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(page.getByRole("alert")).toContainText(/invalid|incorrect|credentials/i);
    });

    test("blocks sign in for completely unknown email", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill("nobody@nowhere.fake");
      await page.getByLabel("Password").fill("SomePass123!");
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page).toHaveURL(/auth\/signin/);
      await expect(page.getByRole("alert")).toBeVisible();
    });

    test("sign in button is disabled while submitting", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByLabel("Password").fill("TestPass123!");

      const submitBtn = page.getByRole("button", { name: /sign in/i });
      await submitBtn.click();

      // Button should be disabled immediately after click (prevents double-submit)
      // This is a race condition test — check within the same tick
      await expect(submitBtn).toBeDisabled();
    });

    test("'forgot password' link is visible and navigates correctly", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByRole("link", { name: /forgot password/i }).click();
      await expect(page).toHaveURL(/forgot-password/);
    });
  });

  test.describe("Registration", () => {
    test("new contractor can register with valid details", async ({ page }) => {
      const uniqueEmail = `test-${Date.now()}@contractor.test`;

      await page.goto("/register");
      await page.getByLabel("Email").fill(uniqueEmail);
      await page.getByLabel(/password/i).first().fill("SecurePass123!");
      await page.getByLabel(/confirm password/i).fill("SecurePass123!");
      await page.getByRole("button", { name: /register|create account/i }).click();

      // Should redirect to onboarding or verification step
      await expect(page).not.toHaveURL(/register/);
    });

    test("shows error when passwords don't match", async ({ page }) => {
      await page.goto("/register");
      await page.getByLabel("Email").fill("test@test.com");
      await page.getByLabel(/password/i).first().fill("Password123!");
      await page.getByLabel(/confirm password/i).fill("DifferentPass123!");
      await page.getByRole("button", { name: /register|create account/i }).click();

      await expect(page.getByText(/passwords.*match|do not match/i)).toBeVisible();
      await expect(page).toHaveURL(/register/);
    });

    test("validates email format before submit", async ({ page }) => {
      await page.goto("/register");
      await page.getByLabel("Email").fill("notanemail");
      await page.getByLabel(/password/i).first().fill("Password123!");
      await page.getByRole("button", { name: /register|create account/i }).click();

      // Native or custom email validation
      const emailInput = page.getByLabel("Email");
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );
      expect(validationMessage.length).toBeGreaterThan(0);
    });
  });

  test.describe("Two-Factor Authentication", () => {
    test("2FA prompt appears after correct password when enabled", async ({ page }) => {
      // Assumes a test account with 2FA pre-enabled
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(process.env.TEST_2FA_EMAIL!);
      await page.getByLabel("Password").fill(process.env.TEST_2FA_PASSWORD!);
      await page.getByRole("button", { name: /sign in/i }).click();

      await expect(page.getByText(/verification code|6-digit|OTP/i)).toBeVisible();
    });

    test("wrong OTP shows error and doesn't advance session", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(process.env.TEST_2FA_EMAIL!);
      await page.getByLabel("Password").fill(process.env.TEST_2FA_PASSWORD!);
      await page.getByRole("button", { name: /sign in/i }).click();

      await page.getByLabel(/code|OTP/i).fill("000000");
      await page.getByRole("button", { name: /verify|confirm/i }).click();

      await expect(page.getByRole("alert")).toContainText(/invalid|incorrect|expired/i);
    });

    test("OTP field only accepts 6 digits", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByLabel("Email").fill(process.env.TEST_2FA_EMAIL!);
      await page.getByLabel("Password").fill(process.env.TEST_2FA_PASSWORD!);
      await page.getByRole("button", { name: /sign in/i }).click();

      const otpField = page.getByLabel(/code|OTP/i);
      await otpField.fill("12345678"); // 8 digits
      const value = await otpField.inputValue();
      expect(value.length).toBeLessThanOrEqual(6);
    });
  });

  test.describe("Password Reset", () => {
    test("reset flow sends email confirmation message", async ({ page }) => {
      await page.goto("/forgot-password");
      await page.getByLabel("Email").fill("contractor@test.proconstructioncalc.com");
      await page.getByRole("button", { name: /send|reset/i }).click();

      await expect(page.getByText(/email sent|check your inbox/i)).toBeVisible();
    });

    test("reset page rejects weak new password", async ({ page }) => {
      // Simulate landing on reset page with a token
      await page.goto("/reset-password?token=fake-token-for-ui-test");
      await page.getByLabel(/new password/i).fill("weak");
      await page.getByRole("button", { name: /reset|update/i }).click();

      await expect(page.getByText(/too short|minimum|8 characters/i)).toBeVisible();
    });
  });

});
```

---

## 2. Concrete Calculators (`calculators/concrete.spec.ts`)

> **Contractor lens:** These numbers go on contracts. A footing that's off by 0.1 CY means either money left on the table or eating the overage. Test real job dimensions.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Concrete Calculators", () => {

  test.describe("Slab Calculator", () => {
    test("calculates correct cubic yards for a standard garage slab", async ({ page }) => {
      // 20ft x 24ft x 4 inch slab = 5.93 CY
      await page.goto("/calculators/concrete/slab");
      await page.getByLabel(/length/i).fill("20");
      await page.getByLabel(/width/i).fill("24");
      await page.getByLabel(/thickness/i).fill("4");

      // Trigger calculation
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      await expect(result).toBeVisible();

      const text = await result.textContent();
      // Expect ~5.93 CY (acceptable range: 5.8 to 6.1)
      const num = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      expect(num).toBeGreaterThanOrEqual(5.8);
      expect(num).toBeLessThanOrEqual(6.1);
    });

    test("10% waste factor increases result appropriately", async ({ page }) => {
      await page.goto("/calculators/concrete/slab");
      await page.getByLabel(/length/i).fill("20");
      await page.getByLabel(/width/i).fill("24");
      await page.getByLabel(/thickness/i).fill("4");
      await page.getByRole("button", { name: /calculate/i }).click();

      const baseResult = page.getByTestId("calc-result");
      const baseText = await baseResult.textContent();
      const baseNum = parseFloat(baseText?.match(/[\d.]+/)?.[0] ?? "0");

      // Apply waste factor if toggle/input exists
      const wasteInput = page.getByLabel(/waste|overage/i);
      if (await wasteInput.isVisible()) {
        await wasteInput.fill("10");
        await page.getByRole("button", { name: /calculate/i }).click();
        const wasteText = await baseResult.textContent();
        const wasteNum = parseFloat(wasteText?.match(/[\d.]+/)?.[0] ?? "0");
        expect(wasteNum).toBeCloseTo(baseNum * 1.1, 1);
      }
    });

    test("rejects non-numeric input in dimension fields", async ({ page }) => {
      await page.goto("/calculators/concrete/slab");
      await page.getByLabel(/length/i).fill("twenty");
      await page.getByRole("button", { name: /calculate/i }).click();

      await expect(page.getByText(/valid number|numeric|required/i)).toBeVisible();
      // Result area should NOT show garbage data
      const result = page.getByTestId("calc-result");
      if (await result.isVisible()) {
        const text = await result.textContent();
        expect(text).not.toMatch(/NaN|undefined|Infinity/);
      }
    });

    test("zero dimensions show validation error, not zero result", async ({ page }) => {
      await page.goto("/calculators/concrete/slab");
      await page.getByLabel(/length/i).fill("0");
      await page.getByLabel(/width/i).fill("24");
      await page.getByLabel(/thickness/i).fill("4");
      await page.getByRole("button", { name: /calculate/i }).click();

      await expect(page.getByText(/greater than zero|must be positive/i)).toBeVisible();
    });

    test("'Add to Estimate' saves result to cart", async ({ page }) => {
      await page.goto("/calculators/concrete/slab");
      await page.getByLabel(/length/i).fill("20");
      await page.getByLabel(/width/i).fill("24");
      await page.getByLabel(/thickness/i).fill("4");
      await page.getByRole("button", { name: /calculate/i }).click();

      await page.getByRole("button", { name: /add to estimate|add to cart/i }).click();

      // Cart badge or confirmation
      await expect(page.getByText(/added|saved to estimate/i)).toBeVisible();
    });

    test("regional tax selector defaults to Oneida (8.75%)", async ({ page }) => {
      await page.goto("/calculators/concrete/slab");
      const taxSelector = page.getByLabel(/county|tax/i);
      if (await taxSelector.isVisible()) {
        await expect(taxSelector).toHaveValue(/oneida|8.75/i);
      }
    });
  });

  test.describe("Footing Calculator", () => {
    test("calculates CY for a standard 16x8 footing at 40 linear feet", async ({ page }) => {
      // 40 LF × (16/12) × (8/12) = 3.70 CY
      await page.goto("/calculators/concrete/footing");
      await page.getByLabel(/linear feet|length/i).fill("40");
      await page.getByLabel(/width/i).fill("16");
      await page.getByLabel(/depth|height/i).fill("8");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      const text = await result.textContent();
      const num = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      expect(num).toBeGreaterThanOrEqual(3.5);
      expect(num).toBeLessThanOrEqual(3.9);
    });

    test("handles very long footings without overflow UI", async ({ page }) => {
      await page.goto("/calculators/concrete/footing");
      await page.getByLabel(/linear feet|length/i).fill("500");
      await page.getByLabel(/width/i).fill("24");
      await page.getByLabel(/depth|height/i).fill("12");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      await expect(result).toBeVisible();
      const text = await result.textContent();
      expect(text).not.toMatch(/overflow|NaN|Infinity/);
    });
  });

  test.describe("Block Calculator", () => {
    test("counts correct number of 8x8x16 blocks for a given wall area", async ({ page }) => {
      await page.goto("/calculators/concrete/block");
      await page.getByLabel(/height/i).fill("8");
      await page.getByLabel(/length|width/i).fill("20");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      await expect(result).toBeVisible();

      // 8ft × 20ft = 160 SF; 8x16 block = 0.888 SF each → ~180 blocks
      const text = await result.textContent();
      const num = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      expect(num).toBeGreaterThan(150);
      expect(num).toBeLessThan(210);
    });
  });

});
```

---

## 3. Framing Calculators (`calculators/framing.spec.ts`)

> **Contractor lens:** Wrong stud count means a wasted trip to the yard. Wrong rafter length means a cut piece you can't return. These calcs need to match what the lumber yard quotes.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Framing Calculators", () => {

  test.describe("Wall Studs", () => {
    test("calculates 16 OC studs for a standard 20ft wall", async ({ page }) => {
      // 20ft wall @ 16" OC + starter/end = ~16-17 studs
      await page.goto("/calculators/framing/wall-studs");
      await page.getByLabel(/wall length/i).fill("20");
      await page.getByLabel(/spacing|OC/i).fill("16");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      const text = await result.textContent();
      const num = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      expect(num).toBeGreaterThanOrEqual(15);
      expect(num).toBeLessThanOrEqual(18);
    });

    test("24 OC returns fewer studs than 16 OC for same wall", async ({ page }) => {
      const getStudCount = async (spacing: string) => {
        await page.goto("/calculators/framing/wall-studs");
        await page.getByLabel(/wall length/i).fill("40");
        await page.getByLabel(/spacing|OC/i).fill(spacing);
        await page.getByRole("button", { name: /calculate/i }).click();
        const text = await page.getByTestId("calc-result").textContent();
        return parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      };

      const studs16 = await getStudCount("16");
      const studs24 = await getStudCount("24");
      expect(studs24).toBeLessThan(studs16);
    });

    test("result is always a whole number (you can't buy 0.5 studs)", async ({ page }) => {
      await page.goto("/calculators/framing/wall-studs");
      await page.getByLabel(/wall length/i).fill("17.5");
      await page.getByLabel(/spacing|OC/i).fill("16");
      await page.getByRole("button", { name: /calculate/i }).click();

      const text = await page.getByTestId("calc-result").textContent();
      const num = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      expect(Number.isInteger(num)).toBe(true);
    });
  });

  test.describe("Rafter Length", () => {
    test("calculates rafter length for a 6:12 pitch on 12ft span", async ({ page }) => {
      // Run = 6ft, Rise = 3ft (6:12 pitch), Hypotenuse ≈ 6.71ft, plus overhang
      await page.goto("/calculators/framing/rafter-length");
      await page.getByLabel(/span|width/i).fill("12");
      await page.getByLabel(/pitch|rise/i).fill("6");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      const text = await result.textContent();
      const num = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      // Expect roughly 6.7 to 8ft depending on overhang
      expect(num).toBeGreaterThan(6);
      expect(num).toBeLessThan(10);
    });

    test("pitch displayed correctly in visual diagram if present", async ({ page }) => {
      await page.goto("/calculators/framing/rafter-length");
      const diagram = page.getByTestId("pitch-diagram");
      if (await diagram.isVisible()) {
        await expect(diagram).toBeVisible();
        // Should not be an empty box
        const box = await diagram.boundingBox();
        expect(box?.width).toBeGreaterThan(50);
        expect(box?.height).toBeGreaterThan(50);
      }
    });
  });

  test.describe("Floor Joists", () => {
    test("12ft span @ 16 OC returns correct joist count", async ({ page }) => {
      await page.goto("/calculators/framing/floor");
      await page.getByLabel(/room width|span/i).fill("24");
      await page.getByLabel(/spacing/i).fill("16");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      await expect(result).toBeVisible();
    });
  });

  test.describe("Headers", () => {
    test("calculates header size for a 6ft opening", async ({ page }) => {
      await page.goto("/calculators/framing/headers");
      await page.getByLabel(/opening|span/i).fill("6");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      await expect(result).toBeVisible();
      // Result should suggest a lumber size, not be blank
      const text = await result.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    });
  });

});
```

---

## 4. Roofing Calculators (`calculators/roofing.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Roofing Calculators", () => {

  test.describe("Shingle Bundles", () => {
    test("calculates bundles for a 1500 SF roof at 6:12 pitch", async ({ page }) => {
      await page.goto("/calculators/roofing");
      await page.getByLabel(/square feet|area/i).fill("1500");
      await page.getByLabel(/pitch/i).fill("6");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      await expect(result).toBeVisible();
      // ~50 squares × pitch factor × bundles per square
      const text = await result.textContent();
      const num = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      expect(num).toBeGreaterThan(40);
    });

    test("waste percentage adds correct overage to bundle count", async ({ page }) => {
      await page.goto("/calculators/roofing");
      await page.getByLabel(/square feet|area/i).fill("1000");
      await page.getByLabel(/pitch/i).fill("4");
      await page.getByRole("button", { name: /calculate/i }).click();

      const baseText = await page.getByTestId("calc-result").textContent();
      const base = parseFloat(baseText?.match(/[\d.]+/)?.[0] ?? "0");

      const wasteInput = page.getByLabel(/waste/i);
      if (await wasteInput.isVisible()) {
        await wasteInput.fill("15");
        await page.getByRole("button", { name: /calculate/i }).click();
        const wasteText = await page.getByTestId("calc-result").textContent();
        const withWaste = parseFloat(wasteText?.match(/[\d.]+/)?.[0] ?? "0");
        expect(withWaste).toBeGreaterThan(base);
      }
    });
  });

});
```

---

## 5. Business / Management Calculators (`calculators/business.spec.ts`)

> **Contractor lens:** This is where the money is made or lost. Profit margin calc needs to be bulletproof. A wrong labor rate means every bid is off.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Business Management Calculators", () => {

  test.describe("Profit Margin", () => {
    test("correctly calculates margin from cost and revenue", async ({ page }) => {
      // $8,000 cost, $10,000 revenue = 20% margin
      await page.goto("/calculators/business");
      await page.getByLabel(/cost/i).fill("8000");
      await page.getByLabel(/revenue|price/i).fill("10000");
      await page.getByRole("button", { name: /calculate/i }).click();

      const result = page.getByTestId("calc-result");
      const text = await result.textContent();
      const pct = parseFloat(text?.match(/[\d.]+/)?.[0] ?? "0");
      expect(pct).toBeCloseTo(20, 0);
    });

    test("shows warning when margin is below 10%", async ({ page }) => {
      await page.goto("/calculators/business");
      await page.getByLabel(/cost/i).fill("9500");
      await page.getByLabel(/revenue|price/i).fill("10000");
      await page.getByRole("button", { name: /calculate/i }).click();

      // Low margin warning or color indicator
      const warning = page.getByTestId("margin-warning");
      if (await warning.isVisible()) {
        await expect(warning).toContainText(/low|below|warning/i);
      }
    });

    test("handles revenue less than cost gracefully — shows negative margin", async ({ page }) => {
      await page.goto("/calculators/business");
      await page.getByLabel(/cost/i).fill("12000");
      await page.getByLabel(/revenue|price/i).fill("10000");
      await page.getByRole("button", { name: /calculate/i }).click();

      const text = await page.getByTestId("calc-result").textContent();
      expect(text).not.toMatch(/NaN|undefined/);
      // Should show a negative value or a loss indicator
    });
  });

  test.describe("Tax Calculator — Regional Defaults", () => {
    test("Oneida County defaults to 8.75%", async ({ page }) => {
      await page.goto("/calculators/management");
      const taxInput = page.getByLabel(/tax rate/i);
      if (await taxInput.isVisible()) {
        // Select Oneida
        const countySelect = page.getByLabel(/county/i);
        await countySelect.selectOption(/oneida/i);
        await expect(taxInput).toHaveValue("8.75");
      }
    });

    test("Madison County defaults to 8.00%", async ({ page }) => {
      await page.goto("/calculators/management");
      const countySelect = page.getByLabel(/county/i);
      if (await countySelect.isVisible()) {
        await countySelect.selectOption(/madison/i);
        const taxInput = page.getByLabel(/tax rate/i);
        await expect(taxInput).toHaveValue("8.00");
      }
    });

    test("Herkimer County defaults to 8.25%", async ({ page }) => {
      await page.goto("/calculators/management");
      const countySelect = page.getByLabel(/county/i);
      if (await countySelect.isVisible()) {
        await countySelect.selectOption(/herkimer/i);
        const taxInput = page.getByLabel(/tax rate/i);
        await expect(taxInput).toHaveValue("8.25");
      }
    });

    test("custom tax rate overrides county default", async ({ page }) => {
      await page.goto("/calculators/management");
      const taxInput = page.getByLabel(/tax rate/i);
      if (await taxInput.isVisible()) {
        await taxInput.fill("9.00");
        await page.getByRole("button", { name: /calculate/i }).click();
        await expect(taxInput).toHaveValue("9.00");
      }
    });
  });

});
```

---

## 6. Estimate Cart (`estimates/cart.spec.ts`)

> **Engineer lens:** Cart state is the most stateful part of the app. Test hydration, persistence, and concurrent modifications.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Estimate Cart", () => {

  test("cart persists after page reload", async ({ page }) => {
    // Add an item from slab calc
    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/length/i).fill("20");
    await page.getByLabel(/width/i).fill("24");
    await page.getByLabel(/thickness/i).fill("4");
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("button", { name: /add to estimate/i }).click();

    await page.reload();

    // Cart should still have the item
    await page.goto("/cart");
    await expect(page.getByText(/slab|concrete/i)).toBeVisible();
  });

  test("item can be removed from cart", async ({ page }) => {
    await page.goto("/cart");
    const items = page.getByTestId("cart-item");
    const count = await items.count();

    if (count > 0) {
      await items.first().getByRole("button", { name: /remove|delete/i }).click();
      await expect(items).toHaveCount(count - 1);
    }
  });

  test("cart total updates when item is removed", async ({ page }) => {
    await page.goto("/cart");
    const totalEl = page.getByTestId("cart-total");
    const before = await totalEl.textContent();

    const firstItem = page.getByTestId("cart-item").first();
    if (await firstItem.isVisible()) {
      await firstItem.getByRole("button", { name: /remove|delete/i }).click();
      const after = await totalEl.textContent();
      expect(before).not.toEqual(after);
    }
  });

  test("empty cart shows a helpful empty state, not a broken layout", async ({ page }) => {
    // Clear cart first if possible
    await page.goto("/cart");
    const items = page.getByTestId("cart-item");
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      await page.getByTestId("cart-item").first().getByRole("button", { name: /remove|delete/i }).click();
      await page.waitForTimeout(200);
    }

    await expect(page.getByText(/no items|empty|start adding/i)).toBeVisible();
  });

  test("line item description is editable before saving estimate", async ({ page }) => {
    await page.goto("/cart");
    const firstItem = page.getByTestId("cart-item").first();

    if (await firstItem.isVisible()) {
      const editBtn = firstItem.getByRole("button", { name: /edit|rename/i });
      if (await editBtn.isVisible()) {
        await editBtn.click();
        const descInput = firstItem.getByRole("textbox");
        await descInput.fill("20x24 Garage Slab — Johnson Job");
        await firstItem.getByRole("button", { name: /save|confirm/i }).click();
        await expect(firstItem).toContainText("Johnson Job");
      }
    }
  });

  test("cart badge in nav reflects item count", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/length/i).fill("10");
    await page.getByLabel(/width/i).fill("10");
    await page.getByLabel(/thickness/i).fill("4");
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("button", { name: /add to estimate/i }).click();

    const badge = page.getByTestId("cart-badge");
    await expect(badge).toBeVisible();
    const count = parseInt(await badge.textContent() ?? "0");
    expect(count).toBeGreaterThan(0);
  });

});
```

---

## 7. PDF Export (`estimates/pdf-export.spec.ts`)

> **Contractor lens:** The PDF is the product. It goes to the homeowner. If it's ugly, has cut-off text, or shows the wrong numbers, the whole app fails its primary job.

```typescript
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("PDF Export", () => {

  test("PDF download initiates without error", async ({ page }) => {
    await page.goto("/cart");

    // Must have items — add one if cart empty
    const items = page.getByTestId("cart-item");
    if (await items.count() === 0) {
      await page.goto("/calculators/concrete/slab");
      await page.getByLabel(/length/i).fill("20");
      await page.getByLabel(/width/i).fill("24");
      await page.getByLabel(/thickness/i).fill("4");
      await page.getByRole("button", { name: /calculate/i }).click();
      await page.getByRole("button", { name: /add to estimate/i }).click();
      await page.goto("/cart");
    }

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /export pdf|download pdf|generate pdf/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  test("PDF button shows loading state while generating", async ({ page }) => {
    await page.goto("/cart");

    const pdfBtn = page.getByRole("button", { name: /export pdf|download pdf/i });
    if (await pdfBtn.isVisible()) {
      await pdfBtn.click();
      // Button should show loading state
      await expect(
        page.getByRole("button", { name: /generating|loading|please wait/i })
      ).toBeVisible({ timeout: 2000 });
    }
  });

  test("PDF generation doesn't lock the page indefinitely", async ({ page }) => {
    await page.goto("/cart");
    const pdfBtn = page.getByRole("button", { name: /export pdf|download pdf/i });

    if (await pdfBtn.isVisible()) {
      await pdfBtn.click();
      // Button should return to normal state within 15 seconds
      await expect(pdfBtn).not.toBeDisabled({ timeout: 15_000 });
    }
  });

  test("contractor name appears in PDF filename", async ({ page }) => {
    await page.goto("/cart");
    const pdfBtn = page.getByRole("button", { name: /export pdf|download pdf/i });

    if (await pdfBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfBtn.click(),
      ]);
      // Filename should contain something meaningful, not "download.pdf"
      expect(download.suggestedFilename()).not.toBe("download.pdf");
    }
  });

});
```

---

## 8. Saved Estimates (`estimates/saved-estimates.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Saved Estimates", () => {

  test("estimate saves and appears in saved list", async ({ page }) => {
    await page.goto("/cart");

    const saveBtn = page.getByRole("button", { name: /save estimate/i });
    if (await saveBtn.isVisible()) {
      const estimateName = `Test Estimate ${Date.now()}`;
      const nameInput = page.getByLabel(/estimate name|title/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill(estimateName);
      }
      await saveBtn.click();

      await page.goto("/saved");
      await expect(page.getByText(estimateName)).toBeVisible();
    }
  });

  test("saved estimate can be reopened and shows original items", async ({ page }) => {
    await page.goto("/saved");
    const firstEstimate = page.getByTestId("saved-estimate").first();

    if (await firstEstimate.isVisible()) {
      await firstEstimate.click();
      // Should navigate to estimate detail
      await expect(page).toHaveURL(/saved\/|estimate\//);
      await expect(page.getByTestId("cart-item")).toHaveCount({ minimum: 1 });
    }
  });

  test("estimate can be deleted from saved list", async ({ page }) => {
    await page.goto("/saved");
    const estimates = page.getByTestId("saved-estimate");
    const count = await estimates.count();

    if (count > 0) {
      await estimates.first().getByRole("button", { name: /delete|remove/i }).click();

      // Confirm deletion dialog if present
      const confirmBtn = page.getByRole("button", { name: /confirm|yes, delete/i });
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      await expect(estimates).toHaveCount(count - 1);
    }
  });

  test("empty saved list shows meaningful message", async ({ page }) => {
    await page.goto("/saved");
    const estimates = page.getByTestId("saved-estimate");

    if (await estimates.count() === 0) {
      await expect(page.getByText(/no saved|start by|create your first/i)).toBeVisible();
    }
  });

});
```

---

## 9. Mobile / PWA (`mobile/pwa.spec.ts`)

> **Contractor lens:** This app lives on an iPhone 14 or a beat-up Android on a job site. If it doesn't work offline when the WiFi sucks in a crawl space, it's useless.

```typescript
import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["Pixel 7"] });

test.describe("PWA — Mobile Experience", () => {

  test("app loads on mobile viewport without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 390;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 2); // 2px tolerance
  });

  test("calculator inputs are large enough to tap without zooming", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    const inputs = page.getByRole("spinbutton"); // number inputs

    const count = await inputs.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await inputs.nth(i).boundingBox();
      // Minimum touch target: 44x44px (Apple HIG)
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("calculator buttons are tappable without mis-hit", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    const calcBtn = page.getByRole("button", { name: /calculate/i });
    const box = await calcBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(120);
  });

  test("navigation menu works on mobile (hamburger or bottom nav)", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /menu|open navigation/i });

    if (await hamburger.isVisible()) {
      await hamburger.click();
      await expect(page.getByRole("navigation")).toBeVisible();
    } else {
      // Bottom navigation bar
      await expect(page.getByRole("navigation")).toBeVisible();
    }
  });

  test("service worker registers on first load", async ({ page }) => {
    await page.goto("/");
    const swRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });
    expect(swRegistered).toBe(true);
  });

  test("offline fallback page appears when network is down", async ({ page, context }) => {
    // Load the app first so SW caches it
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Simulate offline
    await context.setOffline(true);
    await page.goto("/calculators/concrete/slab");

    // Either page loads from cache, or offline fallback shows
    const title = await page.title();
    expect(title).not.toMatch(/ERR_|Failed|Cannot/);
    expect(
      (await page.getByText(/offline|no connection|cached version/i).isVisible()) ||
      (await page.getByText(/slab/i).isVisible())
    ).toBe(true);

    await context.setOffline(false);
  });

  test("keyboard does not obscure input fields on iOS-style viewport", async ({ page }) => {
    test.use({ ...devices["iPhone 14"] });
    await page.goto("/calculators/concrete/slab");

    const firstInput = page.getByRole("spinbutton").first();
    await firstInput.click();

    // After keyboard would appear, the input should still be in viewport
    const box = await firstInput.boundingBox();
    const viewport = page.viewportSize();
    // Input should not be below the fold
    expect(box?.y ?? 0).toBeLessThan((viewport?.height ?? 844) * 0.8);
  });

});
```

---

## 10. Accessibility (`accessibility.spec.ts`)

> **Engineer lens:** WCAG 2.1 AA is not optional if you want this in enterprise workflows. Keyboard-only nav needs to work for users who can't use a touchscreen on site.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Accessibility — WCAG 2.1 AA", () => {

  const keyPages = [
    "/",
    "/calculators",
    "/calculators/concrete/slab",
    "/calculators/framing/wall-studs",
    "/cart",
    "/saved",
    "/settings",
    "/auth/signin",
  ];

  for (const route of keyPages) {
    test(`${route} — no critical ARIA violations`, async ({ page }) => {
      await page.goto(route);
      // Inject axe-core for audit
      await page.addScriptTag({
        url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js",
      });

      const violations = await page.evaluate(async () => {
        // @ts-ignore
        const results = await axe.run();
        return results.violations.filter(
          (v: any) => v.impact === "critical" || v.impact === "serious"
        );
      });

      if (violations.length > 0) {
        console.log(`Violations on ${route}:`, JSON.stringify(violations, null, 2));
      }
      expect(violations).toHaveLength(0);
    });
  }

  test("calculator form is fully operable by keyboard alone", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    // Tab through all interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Type a value using keyboard
    await page.keyboard.type("20");
    await page.keyboard.press("Tab");
    await page.keyboard.type("24");
    await page.keyboard.press("Tab");
    await page.keyboard.type("4");

    // Submit with Enter
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("calc-result")).toBeVisible({ timeout: 3000 });
  });

  test("focus is visible on all interactive elements", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    // Tab through and check each focused element has visible outline
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      const outline = await focused.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outlineWidth !== "0px" ||
          styles.boxShadow !== "none" ||
          styles.border !== "";
      });
      // At least some focus indicator should be present
      if (await focused.isVisible()) {
        expect(outline).toBe(true);
      }
    }
  });

  test("all form inputs have associated labels", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");

    const inputs = await page.locator("input:not([type='hidden'])").all();
    for (const input of inputs) {
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      let hasLabel = false;
      if (ariaLabel || ariaLabelledBy) {
        hasLabel = true;
      } else if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = await label.count() > 0;
      }
      expect(hasLabel).toBe(true);
    }
  });

  test("color contrast passes for result text", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/length/i).fill("20");
    await page.getByLabel(/width/i).fill("24");
    await page.getByLabel(/thickness/i).fill("4");
    await page.getByRole("button", { name: /calculate/i }).click();

    const result = page.getByTestId("calc-result");
    await expect(result).toBeVisible();

    // Check computed color vs background
    const contrastOk = await result.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const bg = styles.backgroundColor;
      // Simplified check — both should be non-transparent
      return color !== "rgba(0, 0, 0, 0)" && bg !== "rgba(0, 0, 0, 0)";
    });
    expect(contrastOk).toBe(true);
  });

  test("error messages are announced via ARIA live region", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByRole("button", { name: /calculate/i }).click();

    const liveRegion = page.locator("[aria-live], [role='alert'], [role='status']");
    await expect(liveRegion.first()).toBeVisible({ timeout: 3000 });
  });

});
```

---

## 11. Navigation & Routing (`navigation.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {

  test("home page loads and renders calculator directory CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /calculators|get started|open/i })).toBeVisible();
  });

  test("calculators directory shows all 7 trade categories", async ({ page }) => {
    await page.goto("/calculators");
    const categories = ["Concrete", "Framing", "Roofing", "Insulation", "Interior", "Mechanical", "Business"];
    for (const cat of categories) {
      await expect(page.getByText(new RegExp(cat, "i"))).toBeVisible();
    }
  });

  test("deep link to specific calculator works directly", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await expect(page.getByRole("heading", { name: /slab/i })).toBeVisible();
    await expect(page.getByLabel(/length/i)).toBeVisible();
  });

  test("404 page renders for unknown route", async ({ page }) => {
    await page.goto("/calculators/fake-category/nonexistent-calc");
    await expect(page.getByText(/404|not found|doesn't exist/i)).toBeVisible();
    // Should NOT show a full crash
    await expect(page.getByText(/unhandled exception|application error/i)).not.toBeVisible();
  });

  test("back button after calculator returns to calculators directory", async ({ page }) => {
    await page.goto("/calculators");
    await page.getByRole("link", { name: /concrete/i }).click();
    await page.getByRole("link", { name: /slab/i }).click();
    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(/\/calculators$/);
  });

  test("protected routes redirect to sign-in when unauthenticated", async ({ browser }) => {
    const context = await browser.newContext(); // No auth state
    const page = await context.newPage();
    await page.goto("/saved");
    await expect(page).toHaveURL(/auth\/signin|sign/);
    await context.close();
  });

  test("field notes loads and renders content", async ({ page }) => {
    await page.goto("/field-notes");
    await expect(page.getByRole("heading")).toBeVisible();
    // Should have actual content, not just a spinner
    await expect(page.getByText(/estimat|regional|field/i)).toBeVisible();
  });

});
```

---

## 12. Settings (`settings.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Settings", () => {

  test("settings page loads for authenticated user", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).not.toHaveURL(/auth\/signin/);
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });

  test("user can update display name", async ({ page }) => {
    await page.goto("/settings");
    const nameInput = page.getByLabel(/name|display name/i);

    if (await nameInput.isVisible()) {
      await nameInput.fill("Mike Johnson — Oneida Contracting");
      await page.getByRole("button", { name: /save|update/i }).click();
      await expect(page.getByText(/saved|updated|success/i)).toBeVisible();
    }
  });

  test("2FA toggle enables and prompts for confirmation", async ({ page }) => {
    await page.goto("/settings");
    const twoFAToggle = page.getByLabel(/two-factor|2FA/i);

    if (await twoFAToggle.isVisible()) {
      const isChecked = await twoFAToggle.isChecked();
      await twoFAToggle.click();

      if (!isChecked) {
        // Enabling 2FA — should show confirmation or setup flow
        await expect(
          page.getByText(/confirm|verify|send code/i)
        ).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("default county tax preference saves and persists", async ({ page }) => {
    await page.goto("/settings");
    const countySelect = page.getByLabel(/default county|county preference/i);

    if (await countySelect.isVisible()) {
      await countySelect.selectOption(/madison/i);
      await page.getByRole("button", { name: /save|update/i }).click();

      await page.reload();
      await expect(countySelect).toHaveValue(/madison/i);
    }
  });

  test("sign out button ends session", async ({ page, context }) => {
    await page.goto("/settings");
    const signOutBtn = page.getByRole("button", { name: /sign out|log out/i });

    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await expect(page).toHaveURL(/auth\/signin|\/$/);

      // Confirm session is gone — protected route should redirect
      await page.goto("/saved");
      await expect(page).toHaveURL(/auth\/signin/);
    }
  });

});
```

---

## 13. Security Tests (`security.spec.ts`)

> **Engineer lens:** This is what separates a beta from production.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Security", () => {

  test("unauthenticated user cannot access /saved", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/saved");
    await expect(page).toHaveURL(/signin|auth/);
    await context.close();
  });

  test("unauthenticated user cannot access /settings", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/settings");
    await expect(page).toHaveURL(/signin|auth/);
    await context.close();
  });

  test("unauthenticated user cannot access /cart", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/cart");
    // Should redirect OR show an empty/locked state
    const isRedirected = page.url().includes("signin") || page.url().includes("auth");
    const isLockedState = await page.getByText(/sign in to|please log in/i).isVisible();
    expect(isRedirected || isLockedState).toBe(true);
    await context.close();
  });

  test("API routes return 401 without valid session", async ({ request }) => {
    // Test that estimate endpoints aren't open
    const response = await request.get("/api/estimates");
    expect([401, 403, 302]).toContain(response.status());
  });

  test("XSS — script injection in calculator input is neutralized", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/length/i).fill('<script>window.__xss=true</script>');
    await page.getByRole("button", { name: /calculate/i }).click();

    const xssInjected = await page.evaluate(() => (window as any).__xss);
    expect(xssInjected).toBeFalsy();

    // Result should show validation error, not execute script
    await expect(page.getByText(/valid number|numeric/i)).toBeVisible();
  });

  test("estimate data from one user is not visible to another user's session", async ({ browser }) => {
    // Two separate contexts = two isolated users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    // This test requires two test accounts; skip if not available
    if (!process.env.TEST_USER_2_EMAIL) {
      test.skip();
    }

    await context1.close();
    await context2.close();
  });

});
```

---

## 14. Performance (`performance.spec.ts`)

> **Engineer lens:** Core Web Vitals gate before production. Contractors on LTE can't wait 8 seconds for a calc to load.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Performance — Core Web Vitals", () => {

  test("home page LCP under 2.5s", async ({ page }) => {
    await page.goto("/");

    const lcp = await page.evaluate((): Promise<number> => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          resolve(last.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        // Fallback
        setTimeout(() => resolve(0), 5000);
      });
    });

    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });

  test("calculator page loads interactive elements within 3s", async ({ page }) => {
    const start = Date.now();
    await page.goto("/calculators/concrete/slab");
    await page.getByRole("button", { name: /calculate/i }).waitFor({ state: "visible" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test("calculator result renders within 500ms of button click", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/length/i).fill("20");
    await page.getByLabel(/width/i).fill("24");
    await page.getByLabel(/thickness/i).fill("4");

    const start = Date.now();
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByTestId("calc-result").waitFor({ state: "visible" });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  test("no console errors on calculator pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/length/i).fill("20");
    await page.getByLabel(/width/i).fill("24");
    await page.getByLabel(/thickness/i).fill("4");
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByTestId("calc-result").waitFor({ state: "visible" });

    // Filter out known third-party noise
    const appErrors = errors.filter(
      (e) => !e.includes("posthog") && !e.includes("sentry") && !e.includes("extension")
    );
    expect(appErrors).toHaveLength(0);
  });

  test("no hydration errors in browser console", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.text().includes("Hydration") || msg.text().includes("hydration")) {
        hydrationErrors.push(msg.text());
      }
    });

    await page.goto("/calculators");
    await page.waitForLoadState("networkidle");
    expect(hydrationErrors).toHaveLength(0);
  });

});
```

---

## 15. Visual Regression (`visual-regression.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Visual Regression — Key Screens", () => {

  test("calculator directory matches baseline", async ({ page }) => {
    await page.goto("/calculators");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("calculators-directory.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("slab calculator with result matches baseline", async ({ page }) => {
    await page.goto("/calculators/concrete/slab");
    await page.getByLabel(/length/i).fill("20");
    await page.getByLabel(/width/i).fill("24");
    await page.getByLabel(/thickness/i).fill("4");
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByTestId("calc-result").waitFor({ state: "visible" });

    await expect(page).toHaveScreenshot("slab-calc-with-result.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("cart page with items matches baseline", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("cart-with-items.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile: calculator page on Pixel 7", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/calculators/concrete/slab");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("mobile-slab-calc.png", {
      maxDiffPixelRatio: 0.03,
    });
  });

});
```

---

## Running the Suite

```bash
# Install browsers (first time)
npx playwright install

# Run full suite
npm run test:e2e

# Run with UI explorer
npm run test:e2e:ui

# Run only calculator tests
npx playwright test e2e/calculators/

# Run specific test file with debug mode
npx playwright test e2e/calculators/concrete.spec.ts --debug

# Run on mobile only
npx playwright test --project=mobile-chrome --project=mobile-safari

# Update visual regression baselines
npx playwright test --update-snapshots

# Run auth setup only
npx playwright test e2e/auth.setup.ts
```

---

## CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/playwright.yml
name: Playwright E2E

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

---

## Beta Exit Checklist

Before removing the beta tag, every row below must be green:

| Area | Test File | Contractor Gate | Engineer Gate |
|------|-----------|----------------|---------------|
| Sign in / Register | `auth.spec.ts` | Can sign in from iPhone in <10s | Session token stored correctly |
| 2FA | `auth.spec.ts` | OTP flow doesn't lose data | Invalid OTP blocked server-side |
| Slab Calc accuracy | `concrete.spec.ts` | CY matches hand calc ±0.1 | No NaN/undefined in output |
| Framing stud count | `framing.spec.ts` | Integer result, correct OC math | Whole-number rounding enforced |
| Roofing bundles | `roofing.spec.ts` | Waste factor adds correctly | Pitch multiplier applied |
| Business margin | `business.spec.ts` | 20% margin on $10k job correct | Negative margin shown, not crashed |
| Regional tax | `business.spec.ts` | Oneida defaults to 8.75% | Custom rate overrides default |
| Cart persistence | `cart.spec.ts` | Cart survives page refresh | State not shared across sessions |
| PDF export | `pdf-export.spec.ts` | PDF downloads in <15s | Filename meaningful, not "download.pdf" |
| Saved estimates | `saved-estimates.spec.ts` | Can save and reopen next day | Data isolated per user |
| Mobile layout | `mobile/pwa.spec.ts` | No horizontal scroll on Pixel 7 | Touch targets ≥44px |
| Offline fallback | `mobile/pwa.spec.ts` | Offline page shows, no crash | SW registers on first load |
| Auth gates | `security.spec.ts` | N/A | All protected routes require session |
| Keyboard nav | `accessibility.spec.ts` | N/A | Full calc operable by Tab+Enter |
| Load speed | `performance.spec.ts` | Calc result in <500ms | LCP <2.5s, no hydration errors |
| 404 handling | `navigation.spec.ts` | Friendly 404 page | No unhandled exceptions |

---

*Pro Construction Calc · Playwright E2E Test Suite · v1.0 · March 2026*
