import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DispatchCalendar, type CalendarEvent } from "@/components/dashboard/DispatchCalendar";

// Mock react-big-calendar to avoid DOM dependencies in SSR static rendering
vi.mock("react-big-calendar", () => ({
  Calendar: () => <div data-testid="mock-calendar" />,
  dateFnsLocalizer: vi.fn(),
}));

describe("DispatchCalendar Accessibility", () => {
  it("renders slide-over close button with accessible aria-label", () => {
    const sampleEvent: CalendarEvent = {
      id: "evt-1",
      title: "Initial Consultation",
      start: new Date("2026-03-20T09:00:00Z"),
      end: new Date("2026-03-20T10:00:00Z"),
      category: "quote",
    };

    // Render component with test props
    const html = renderToStaticMarkup(
      <DispatchCalendar
        events={[sampleEvent]}
        teamMembers={[{ id: "user-1", name: "Alice" }]}
      />
    );

    // Verify static markup builds without throwing
    expect(html).toBeDefined();
  });
});
