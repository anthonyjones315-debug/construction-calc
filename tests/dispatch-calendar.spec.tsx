import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DispatchCalendar, type CalendarEvent } from "@/components/dashboard/DispatchCalendar";
import { getDateTimeFormatter } from "@/utils/formatters";

describe("DispatchCalendar", () => {
  const teamMembers = [
    { id: "user-1", name: "Alice Estimator" },
    { id: "user-2", name: "Bob Builder" },
  ];

  const now = new Date();
  const events: CalendarEvent[] = [
    {
      id: "evt-1",
      title: "Foundation Pour",
      start: now,
      end: new Date(now.getTime() + 3600000),
      category: "install",
      assignedUserId: "user-1",
      assignedUserName: "Alice Estimator",
      customerName: "Acme Corp",
    },
    {
      id: "evt-2",
      title: "Site Inspection",
      start: now,
      end: new Date(now.getTime() + 3600000),
      category: "service",
      assignedUserId: "user-2",
      assignedUserName: "Bob Builder",
      customerName: "Beta LLC",
    },
  ];

  it("renders dispatch calendar with team member filters", () => {
    const html = renderToStaticMarkup(
      <DispatchCalendar events={events} teamMembers={teamMembers} />,
    );

    expect(html).toContain("Team (2/2)");
    expect(html).toContain("Foundation Pour");
  });

  it("filters events correctly when initialSelectedMembers is specified", () => {
    const html = renderToStaticMarkup(
      <DispatchCalendar
        events={events}
        teamMembers={teamMembers}
        initialSelectedMembers={["user-1"]}
      />,
    );

    expect(html).toContain("Team (1/2)");
    expect(html).toContain("Foundation Pour");
  });

  it("uses cached getDateTimeFormatter for consistent date formatting", () => {
    const d = new Date("2026-03-20T09:00:00Z");
    const formatter1 = getDateTimeFormatter();
    const formatter2 = getDateTimeFormatter();

    expect(formatter1).toBe(formatter2);
    expect(formatter1.format(d)).toBe(formatter2.format(d));
  });
});
