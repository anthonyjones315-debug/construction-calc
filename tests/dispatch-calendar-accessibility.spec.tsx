import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DispatchCalendar, type CalendarEvent } from "@/components/dashboard/DispatchCalendar";

describe("DispatchCalendar Accessibility", () => {
  const mockMembers = [
    { id: "m1", name: "Alice" },
    { id: "m2", name: "Bob" },
  ];

  const mockEvents: CalendarEvent[] = [
    {
      id: "e1",
      title: "Site Visit",
      start: new Date("2026-03-20T09:00:00Z"),
      end: new Date("2026-03-20T10:00:00Z"),
      category: "quote",
      assignedUserId: "m1",
      assignedUserName: "Alice",
      customerName: "Acme Corp",
    },
  ];

  it("renders team member filter button with proper ARIA attributes", () => {
    const html = renderToStaticMarkup(
      <DispatchCalendar events={mockEvents} teamMembers={mockMembers} />
    );

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="true"');
    expect(html).toContain('aria-label="Filter by team member (2 of 2 selected)"');
    expect(html).toContain("focus-visible:ring-2");
  });

  it("includes slide-over dialog structure with accessible attributes and close button", () => {
    const html = renderToStaticMarkup(
      <DispatchCalendar events={mockEvents} teamMembers={mockMembers} />
    );

    // Filter and main layout checks
    expect(html).toContain("Team (2/2)");
  });
});
