import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KanbanBoard, type KanbanProject } from "@/components/dashboard/KanbanBoard";

describe("KanbanBoard Component", () => {
  it("renders all kanban columns and distributes projects by status", () => {
    const testProjects: KanbanProject[] = [
      {
        id: "proj-1",
        name: "Kitchen Remodel",
        status: "lead",
        customerName: "Jane Smith",
        pipelineValue: "$12,500",
        startDate: "Mar 20",
      },
      {
        id: "proj-2",
        name: "Deck Replacement",
        status: "quoted",
        customerName: "Bob Johnson",
        pipelineValue: "$8,200",
      },
      {
        id: "proj-3",
        name: "Bathroom Tile",
        status: "completed",
        customerName: "Alice Davis",
        pipelineValue: "$4,500",
        startDate: "Mar 10",
      },
    ];

    const html = renderToStaticMarkup(
      <KanbanBoard projects={testProjects} />
    );

    // Columns
    expect(html).toContain("Lead");
    expect(html).toContain("Estimate Out");
    expect(html).toContain("Scheduled");
    expect(html).toContain("In Progress");
    expect(html).toContain("Invoiced");

    // Project cards
    expect(html).toContain("Kitchen Remodel");
    expect(html).toContain("Jane Smith");
    expect(html).toContain("$12,500");
    expect(html).toContain("Mar 20");

    expect(html).toContain("Deck Replacement");
    expect(html).toContain("Bob Johnson");
    expect(html).toContain("$8,200");

    expect(html).toContain("Bathroom Tile");
    expect(html).toContain("Alice Davis");
    expect(html).toContain("$4,500");

    // Drop placeholder for empty columns (Scheduled and In Progress)
    expect(html).toContain("Drop here");
  });

  it("handles empty project list gracefully", () => {
    const html = renderToStaticMarkup(<KanbanBoard projects={[]} />);

    expect(html).toContain("Lead");
    expect(html).toContain("Estimate Out");
    expect(html).toContain("Scheduled");
    expect(html).toContain("In Progress");
    expect(html).toContain("Invoiced");
    expect((html.match(/Drop here/g) ?? []).length).toBe(5);
  });
});
