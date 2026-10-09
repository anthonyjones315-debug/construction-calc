import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DispatchCalendar, CalendarEvent } from "@/components/dashboard/DispatchCalendar";

describe("DispatchCalendar Accessibility", () => {
  const sampleEvents: CalendarEvent[] = [
    {
      id: "evt-1",
      title: "Site Visit",
      start: new Date("2025-05-15T09:00:00Z"),
      end: new Date("2025-05-15T10:00:00Z"),
      category: "quote",
      customerName: "Jane Doe",
    },
  ];

  const sampleMembers = [
    { id: "user-1", name: "Alice Smith" },
  ];

  it("renders calendar toolbar and team member filter controls", () => {
    const html = renderToStaticMarkup(
      <DispatchCalendar
        events={sampleEvents}
        teamMembers={sampleMembers}
      />
    );

    expect(html).toContain("Team (1/1)");
    expect(html).toContain("rbc-calendar");
  });
});
