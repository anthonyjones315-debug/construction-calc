import { describe, expect, it } from "vitest";
import type { UserMaterial } from "@/lib/supabase/client";

const CATEGORIES = [
  "Concrete",
  "Lumber",
  "Roofing",
  "Insulation",
  "Flooring",
  "Siding",
  "Paint",
  "Other",
];

function groupMaterialsByCategory(materials: UserMaterial[]) {
  return CATEGORIES.reduce(
    (acc, cat) => {
      const rows = materials.filter((m) => m.category === cat);
      if (rows.length || cat === "Other") acc[cat] = rows;
      return acc;
    },
    {} as Record<string, UserMaterial[]>,
  );
}

describe("PriceBookContent category grouping memoization logic", () => {
  it("groups materials by category correctly", () => {
    const sampleMaterials: UserMaterial[] = [
      {
        id: "1",
        user_id: "u1",
        business_id: "b1",
        material_name: "Premix Concrete 80lb",
        category: "Concrete",
        unit_type: "bag",
        unit_cost: 6.5,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "2",
        user_id: "u1",
        business_id: "b1",
        material_name: "2x4x8 SPF Stud",
        category: "Lumber",
        unit_type: "each",
        unit_cost: 4.25,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const grouped = groupMaterialsByCategory(sampleMaterials);

    expect(grouped["Concrete"]).toHaveLength(1);
    expect(grouped["Concrete"][0].material_name).toBe("Premix Concrete 80lb");

    expect(grouped["Lumber"]).toHaveLength(1);
    expect(grouped["Lumber"][0].material_name).toBe("2x4x8 SPF Stud");

    expect(grouped["Other"]).toEqual([]);
    expect(grouped["Roofing"]).toBeUndefined();
  });
});
