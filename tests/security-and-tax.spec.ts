import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateNysSalesTax } from "@/services/taxEngine";
import {
  assertNoBusinessIdOverride,
  getTenantScopeColumn,
  getTenantScopeId,
  type BusinessContext,
} from "@/lib/supabase/business";
import { tenantScopedSelect } from "@/lib/supabase/tenant-scope";

function mockContext(overrides: Partial<BusinessContext> = {}): BusinessContext {
  return {
    userId: "user-123",
    businessId: "biz-456",
    role: "owner",
    isOwner: true,
    isAdmin: true,
    canWriteBusinessData: true,
    canDeleteBusinessData: true,
    usesLegacyUserScope: false,
    ...overrides,
  };
}

describe("tenant scoping", () => {
  it("applies business_id scope for workspace tenants", () => {
    const ctx = mockContext({ usesLegacyUserScope: false });
    const callLog: { column?: string; value?: unknown; columns?: string } = {};

    const mockBuilder = {
      select(columns: string) {
        callLog.columns = columns;
        return this;
      },
      eq(column: string, value: unknown) {
        callLog.column = column;
        callLog.value = value;
        return this;
      },
    };

    const mockDb = {
      from() {
        return mockBuilder;
      },
    } as unknown as Pick<SupabaseClient, "from">;

    tenantScopedSelect(mockDb, "saved_estimates", "*", ctx);

    expect(callLog.columns).toBe("*");
    expect(callLog.column).toBe("business_id");
    expect(callLog.value).toBe("biz-456");
  });

  it("falls back to user_id scope for legacy users", () => {
    const ctx = mockContext({ usesLegacyUserScope: true });
    const callLog: { column?: string; value?: unknown } = {};
    const mockDb = {
      from() {
        return {
          select() {
            return this;
          },
          eq(column: string, value: unknown) {
            callLog.column = column;
            callLog.value = value;
            return this;
          },
        };
      },
    } as unknown as Pick<SupabaseClient, "from">;

    tenantScopedSelect(mockDb, "saved_estimates", "id", ctx);

    expect(callLog.column).toBe("user_id");
    expect(callLog.value).toBe("user-123");
    expect(getTenantScopeColumn(ctx)).toBe("user_id");
    expect(getTenantScopeId(ctx)).toBe("user-123");
  });

  it("blocks spoofed tenant_id overrides", () => {
    const ctx = mockContext({ usesLegacyUserScope: false });
    expect(() => assertNoBusinessIdOverride("other-biz", ctx)).toThrow(
      /cannot write data into another business workspace/i,
    );
    expect(() => assertNoBusinessIdOverride("biz-456", ctx)).not.toThrow();
  });
});

describe("Oneida County tax and ST-124 handling", () => {
  it("applies 8.75% Oneida County rate for repairs", () => {
    const result = calculateNysSalesTax({
      county: "Oneida",
      taxableAmount: 100000,
      projectType: "repair-maintenance",
    });

    expect(result.rateApplied).toBeCloseTo(8.75, 2);
    expect(result.statePortion).toBeCloseTo(4000, 2);
    expect(result.localPortion).toBeCloseTo(4750, 2);
    expect(result.taxDue).toBeCloseTo(8750, 2);
    expect(result.requiresST124).toBe(false);
    expect(result.notes.join(" ")).toMatch(/8.75%/);
  });

  it("zero-rates capital improvements and flags ST-124", () => {
    const result = calculateNysSalesTax({
      county: "Oneida",
      taxableAmount: 50000,
      projectType: "capital-improvement",
    });

    expect(result.taxDue).toBe(0);
    expect(result.statePortion).toBe(0);
    expect(result.localPortion).toBe(0);
    expect(result.rateApplied).toBe(0);
    expect(result.requiresST124).toBe(true);
    expect(result.notes.join(" ")).toMatch(/ST-124/i);
  });

  it("applies 8.25% Herkimer County rate for repairs", () => {
    const result = calculateNysSalesTax({
      county: "Herkimer",
      taxableAmount: 1000,
      projectType: "repair-maintenance",
    });

    expect(result.rateApplied).toBeCloseTo(8.25, 2);
    expect(result.statePortion).toBeCloseTo(40, 2);
    expect(result.localPortion).toBeCloseTo(42.5, 2);
    expect(result.taxDue).toBeCloseTo(82.5, 2);
    expect(result.notes.join(" ")).toMatch(/8.25%/);
  });

  it("applies 8.00% Madison County rate for repairs", () => {
    const result = calculateNysSalesTax({
      county: "Madison",
      taxableAmount: 1000,
      projectType: "repair-maintenance",
    });

    expect(result.rateApplied).toBeCloseTo(8.0, 2);
    expect(result.statePortion).toBeCloseTo(40, 2);
    expect(result.localPortion).toBeCloseTo(40, 2);
    expect(result.taxDue).toBeCloseTo(80, 2);
    expect(result.notes.join(" ")).toMatch(/8.00%/);
  });
});
