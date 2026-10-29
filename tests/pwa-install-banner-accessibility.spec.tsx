import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWAInstallBanner focus-visible accessibility styling", () => {
  it("includes focus-visible outline and ring styling on all interactive buttons", () => {
    const filePath = resolve(process.cwd(), "src/components/layout/PWAInstallBanner.tsx");
    const content = readFileSync(filePath, "utf-8");

    // Check that focus-visible ring styles are applied to install and dismiss buttons
    expect(content).toContain("focus-visible:outline-none");
    expect(content).toContain("focus-visible:ring-2");
    expect(content).toContain("focus-visible:ring-white");
    expect(content).toContain("focus-visible:ring-offset-2");
    expect(content).toContain("focus-visible:ring-offset-blue-brand");

    // Ensure non-standard / raw focus styles are replaced
    expect(content).not.toContain("focus:outline-none focus:ring-2");
  });
});
