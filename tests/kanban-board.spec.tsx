import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KanbanBoard, type KanbanProject } from "@/components/dashboard/KanbanBoard";

describe("KanbanBoard Component Accessibility & UX", () => {
  const mockProjects: KanbanProject[] = [
    {
      id: "proj_1",
      name: "Roof Replacement",
      status: "lead",
      customerName: "Alice Smith",
      pipelineValue: "$12,500",
      startDate: "Oct 24",
    },
    {
      id: "proj_2",
      name: "Kitchen Remodel",
      status: "quoted",
      customerName: "Bob Johnson",
      pipelineValue: "$8,200",
    },
  ];

  it("renders columns, projects, and specific card ARIA reorder labels with focus-visible styling", () => {
    const html = renderToStaticMarkup(
      <KanbanBoard projects={mockProjects} />,
    );

    // Columns
    expect(html).toContain("Lead");
    expect(html).toContain("Estimate Out");
    expect(html).toContain("Scheduled");
    expect(html).toContain("In Progress");
    expect(html).toContain("Invoiced");

    // Project cards
    expect(html).toContain("Roof Replacement");
    expect(html).toContain("Kitchen Remodel");
    expect(html).toContain("Alice Smith");

    // Reorder button ARIA label and focus-visible classes
    expect(html).toContain('aria-label="Reorder project Roof Replacement"');
    expect(html).toContain('aria-label="Reorder project Kitchen Remodel"');
    expect(html).toContain("focus-visible:opacity-100");
    expect(html).toContain("focus-visible:ring-2");
  });

  it("renders empty column drop target markup when no projects exist in a column", () => {
    const html = renderToStaticMarkup(
      <KanbanBoard projects={mockProjects} />,
    );

    // Columns without projects should show drop targets
    expect(html).toContain("Drop here");
    expect(html).toContain("text-slate-400");
  });
});
