import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("KanbanBoard accessibility attributes", () => {
  it("includes descriptive aria-label, focus-visible styling, and aria-hidden icons on KanbanCard", () => {
    const filePath = resolve(__dirname, "../src/components/dashboard/KanbanBoard.tsx");
    const content = readFileSync(filePath, "utf8");

    // Check dynamic drag handle aria-label template string
    expect(content).toContain("aria-label={`Drag ${project.name} to reorder`}");

    // Check focus-visible styles for keyboard accessibility
    expect(content).toContain("focus-visible:opacity-100");
    expect(content).toContain("focus-visible:ring-2");
    expect(content).toContain("focus-visible:ring-blue-500");

    // Check aria-hidden on decorative icons
    expect(content).toContain('<GripVertical className="h-3.5 w-3.5" aria-hidden="true" />');
    expect(content).toContain('<User className="h-2.5 w-2.5" aria-hidden="true" />');
    expect(content).toContain('<DollarSign className="h-2.5 w-2.5" aria-hidden="true" />');
    expect(content).toContain('<Calendar className="h-2.5 w-2.5" aria-hidden="true" />');
  });
});
