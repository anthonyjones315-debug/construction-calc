"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Calendar, dateFnsLocalizer, type Event, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronDown, X, User } from "lucide-react";

/* ──────────────────────── localizer ──────────────────────── */

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

/* ──────────────────────── types ──────────────────────── */

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: string;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  projectId?: string | null;
  customerName?: string | null;
  serviceAddress?: string | null;
  customerPhone?: string | null;
  customerId?: string | null;
};

type TeamMember = {
  id: string;
  name: string;
};

type Props = {
  events: CalendarEvent[];
  teamMembers: TeamMember[];
  initialSelectedMembers?: string[];
  onFilterChange?: (selectedMemberIds: string[]) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
};

/* ──────────────────────── color map ──────────────────────── */

const CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
  quote: { bg: "#dbeafe", border: "#3b82f6" },
  service: { bg: "#ffedd5", border: "#f97316" },
  install: { bg: "#dcfce7", border: "#22c55e" },
  maintenance: { bg: "#f3e8ff", border: "#a855f7" },
  internal: { bg: "#f1f5f9", border: "#64748b" },
};

function getEventStyle(category: string) {
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.internal;
  return {
    style: {
      backgroundColor: colors.bg,
      borderLeft: `3px solid ${colors.border}`,
      color: "#1e293b",
      fontSize: "11px",
      fontWeight: 600,
      borderRadius: "6px",
      padding: "2px 6px",
    },
  };
}

/* ──────────────────────── slide-over ──────────────────────── */

function SlideOver({
  event,
  onClose,
}: {
  event: CalendarEvent | null;
  onClose: () => void;
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md animate-slide-in-right bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-800">Event Details</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Event
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {event.title}
            </p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Start
              </p>
              <p className="text-xs text-slate-600">
                {event.start.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                End
              </p>
              <p className="text-xs text-slate-600">
                {event.end.toLocaleString()}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-lg px-2 py-1.5"
            style={{
              backgroundColor:
                CATEGORY_COLORS[event.category]?.bg ?? "#f1f5f9",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[event.category]?.border ?? "#64748b",
              }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {event.category}
            </span>
          </div>
          {event.customerName && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customer
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {event.customerName}
              </p>
            </div>
          )}
          {event.serviceAddress && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Service Address
              </p>
              <p className="text-xs text-slate-600">{event.serviceAddress}</p>
            </div>
          )}
          {event.customerPhone && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Phone
              </p>
              <p className="text-xs text-slate-600">{event.customerPhone}</p>
            </div>
          )}
          {event.assignedUserName && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assigned To
              </p>
              <p className="text-xs text-slate-600">
                {event.assignedUserName}
              </p>
            </div>
          )}
          {event.customerId && (
            <a
              href={`/crm/customers/${event.customerId}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[--color-blue-brand] bg-[--color-blue-soft] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[--color-blue-brand] transition-colors hover:bg-[--color-blue-brand] hover:text-white"
            >
              Go to Customer File
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── multi-select ─────────────────── */

function TeamMemberFilter({
  members,
  selected,
  onChange,
}: {
  members: TeamMember[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300"
      >
        <User className="h-3 w-3" />
        Team ({selected.length}/{members.length})
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {members.map((m) => (
            <label
              key={m.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(m.id)}
                onChange={() => toggle(m.id)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-[--color-blue-brand] focus:ring-[--color-blue-brand]"
              />
              {m.name}
            </label>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="mt-1 w-full rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-200"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────── main component ──────────────────── */

export function DispatchCalendar({
  events,
  teamMembers,
  initialSelectedMembers,
  onFilterChange,
  onSelectEvent: externalOnSelect,
}: Props) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialSelectedMembers ?? teamMembers.map((m) => m.id),
  );
  const [slideOverEvent, setSlideOverEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [currentView, setCurrentView] = useState<View>("week");
  const [isMobile, setIsMobile] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const filteredEvents = useMemo(() => {
    if (selectedMembers.length === teamMembers.length) return events;
    return events.filter(
      (e) => e.assignedUserId && selectedMembers.includes(e.assignedUserId),
    );
  }, [events, selectedMembers, teamMembers.length]);

  const handleFilterChange = useCallback(
    (ids: string[]) => {
      setSelectedMembers(ids);
      onFilterChange?.(ids);
    },
    [onFilterChange],
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setSlideOverEvent(event);
      externalOnSelect?.(event);
    },
    [externalOnSelect],
  );

  // Inject global animation style
  useEffect(() => {
    const id = "dispatch-calendar-animations";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      .animate-slide-in-right { animation: slideInRight 0.25s ease-out; }
    `;
    document.head.appendChild(style);
  }, []);

  // Detect mobile viewport after hydration (safe from SSR mismatch)
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setCurrentView("day");
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <TeamMemberFilter
          members={teamMembers}
          selected={selectedMembers}
          onChange={handleFilterChange}
        />
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => (
            <span
              key={cat}
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: colors.bg, color: colors.border }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: colors.border }}
              />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm [&_.rbc-toolbar]:mb-3 [&_.rbc-toolbar_button]:rounded-lg [&_.rbc-toolbar_button]:border-slate-200 [&_.rbc-toolbar_button]:text-xs [&_.rbc-toolbar_button]:font-semibold [&_.rbc-header]:text-[10px] [&_.rbc-header]:font-bold [&_.rbc-header]:uppercase [&_.rbc-header]:tracking-wider [&_.rbc-header]:text-slate-500">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: isMobile ? 350 : 600 }}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => getEventStyle(event.category)}
          views={["month", "week", "day"]}
        />
      </div>

      {/* Slide-Over */}
      <SlideOver
        event={slideOverEvent}
        onClose={() => setSlideOverEvent(null)}
      />
    </div>
  );
}
