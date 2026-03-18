import { describe, expect, it } from "vitest";
import {
  HERKIMER_BASIS_POINTS,
  MADISON_BASIS_POINTS,
  ONEIDA_BASIS_POINTS,
  saveCalculation,
  verifyEstimate,
} from "@/app/actions/calculations";

describe("verifyEstimate", () => {
  it("uses integer basis-point math for Oneida County", () => {
    const verified = verifyEstimate({
      subtotal_cents: 123_45,
      county: "Oneida",
      tax_cents: 0,
      total_cents: 0,
    });

    expect(verified.tax_basis_points).toBe(ONEIDA_BASIS_POINTS);
    expect(verified.tax_cents).toBe(1_080);
    expect(verified.total_cents).toBe(13_425);
    expect(verified.verification_status).toBe("corrected");
  });

  it("resolves Herkimer and Madison basis points exactly", () => {
    const herkimer = verifyEstimate({
      subtotal_cents: 10_000,
      county: "Herkimer",
    });
    const madison = verifyEstimate({
      subtotal_cents: 10_000,
      county: "Madison",
    });

    expect(herkimer.tax_basis_points).toBe(HERKIMER_BASIS_POINTS);
    expect(herkimer.tax_cents).toBe(825);
    expect(madison.tax_basis_points).toBe(MADISON_BASIS_POINTS);
    expect(madison.tax_cents).toBe(800);
  });
});

describe("saveCalculation", () => {
  it("self-heals after a check-constraint rejection", async () => {
    const insertedPayloads: Array<Record<string, unknown>> = [];
    let attempts = 0;

    const db = {
      from() {
        return {
          insert(payload: Record<string, unknown>) {
            insertedPayloads.push(payload);
            attempts += 1;
            return {
              select() {
                return {
                  async single() {
                    if (attempts === 1) {
                      return {
                        data: null,
                        error: {
                          code: "23514",
                          message: "new row violates check constraint",
                        },
                      };
                    }

                    return {
                      data: { id: "estimate-1" },
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      },
    };

    const result = await saveCalculation(
      db,
      { name: "Wall Estimate" },
      {
        subtotal_cents: 20_000,
        tax_cents: 10,
        total_cents: 20_010,
        county: "Madison",
      },
    );

    expect(insertedPayloads).toHaveLength(2);
    expect(insertedPayloads[0]?.tax_cents).toBe(1_600);
    expect(insertedPayloads[0]?.total_cents).toBe(21_600);
    expect(insertedPayloads[1]?.tax_cents).toBe(1_600);
    expect(insertedPayloads[1]?.total_cents).toBe(21_600);
    expect(result.data).toEqual({ id: "estimate-1" });
    expect(result.correctedData).toEqual({
      subtotal_cents: 20_000,
      tax_cents: 1_600,
      total_cents: 21_600,
      tax_basis_points: MADISON_BASIS_POINTS,
      verified_county: "Madison",
    });
  });
});
