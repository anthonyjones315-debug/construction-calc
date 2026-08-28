import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KanbanBoard, type KanbanProject } from "@/components/dashboard/KanbanBoard";

describe("KanbanBoard accessibility", () => {
  it("renders drag handle with project-specific aria-label and focus-visible styling", () => {
    const mockProjects: KanbanProject[] = [
      {
        id: "proj_1",
        name: "Kitchen Remodel",
        status: "lead",
        customerName: "Jane Doe",
      },
    ];

    const html = renderToStaticMarkup(<KanbanBoard projects={mockProjects} />);

    expect(html).toContain('aria-label="Drag Kitchen Remodel to reorder"');
    expect(html).toContain("focus-visible:opacity-100");
    expect(html).toContain("focus-visible:ring-2");
  });
});
