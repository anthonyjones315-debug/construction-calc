import { describe, expect, it } from "vitest";
import { calcWireGauge } from "@/calculators";

function findResult(
  results: ReturnType<typeof calcWireGauge>,
  label: string,
) {
  const result = results.find((item) => item.label === label);
  expect(result).toBeDefined();
  return result!;
}

describe("calculator regressions", () => {
  it("sizes a 40A copper run without exceeding branch-circuit voltage drop guidance", () => {
    const results = calcWireGauge({
      amps: 40,
      voltage: 120,
      distance: 50,
      material: "copper",
    });

    expect(findResult(results, "Recommended Gauge").value).toBe("8 AWG");
    expect(findResult(results, "Voltage Drop").value).toBe("3.11");
    expect(findResult(results, "Wire Length").value).toBe("100");
  });
});
