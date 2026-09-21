import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DispatchCalendar, CalendarEvent } from "@/components/dashboard/DispatchCalendar";

describe("DispatchCalendar Accessibility", () => {
  const mockEvent: CalendarEvent = {
    id: "evt-1",
    title: "Initial Site Consultation",
    start: new Date("2026-03-20T09:00:00Z"),
    end: new Date("2026-03-20T10:00:00Z"),
    category: "quote",
    customerName: "Acme Corp",
  };

  const mockTeamMembers = [
    { id: "tm-1", name: "Alice Johnson" },
    { id: "tm-2", name: "Bob Smith" },
  ];

  it("renders team member filter button with proper accessibility attributes", () => {
    const html = renderToStaticMarkup(
      <DispatchCalendar
        events={[mockEvent]}
        teamMembers={mockTeamMembers}
      />
    );

    expect(html).toContain('aria-label="Filter by team members, 2 of 2 selected"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="true"');
    expect(html).toContain('focus-visible:ring-[--color-blue-brand]');
  });
});
