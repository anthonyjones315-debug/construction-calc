"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Mail,
  Phone,
  Plus,
  StickyNote,
  CreditCard,
  Calendar,
  Receipt,
  Clock,
  Send,
} from "lucide-react";
import type { Route } from "next";
import type { ClientDTO } from "@/lib/dal/clients";
import { routes } from "@routes";

type ShortEstimate = {
  id: string;
  name: string;
  status: string | null;
  total_cost: number | null;
  updated_at: string;
};

type ClientNote = {
  id: string;
  text: string;
  createdAt: string;
};

type DetailTab = "estimates" | "invoices" | "payments" | "schedule";

const TABS: { id: DetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "estimates", label: "Estimates", icon: FileText },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "schedule", label: "Schedule", icon: Calendar },
];

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function statusBadgeClasses(status: string | null): string {
  if (status === "SIGNED" || status === "Approved") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
  }
  if (status === "PENDING" || status === "Sent") {
    return "border-blue-600/40 bg-blue-600/10 text-blue-800";
  }
  return "border-[--color-border] bg-[--color-surface-alt] text-[--color-ink-mid]";
}

function formatStatus(status: string | null): string {
  if (status === "SIGNED" || status === "Approved") return "Signed";
  if (status === "PENDING" || status === "Sent") return "Sent";
  return "Draft";
}

// ─── Estimates Tab ─────────────────────────────────────────────────────────────

function EstimatesTab({ clientId, estimates }: { clientId: string; estimates: ShortEstimate[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
          Estimates ({estimates.length})
        </h3>
        <Link
          href={`/command-center/estimates/new?clientId=${clientId}` as Route}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-[--color-blue-brand] px-4 text-[11px] font-black uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[--color-blue-dark]"
        >
          <Plus className="h-3.5 w-3.5" /> New Estimate
        </Link>
      </div>

      {estimates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--color-border] bg-[--color-surface-alt] py-10 text-center">
          <FileText className="mb-2 h-7 w-7 text-[--color-ink-dim] opacity-40" />
          <p className="text-sm font-semibold text-[--color-ink-mid]">No estimates yet</p>
          <p className="mt-1 text-xs text-[--color-ink-dim]">
            Create an estimate for this client to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {estimates.map((est) => (
            <Link
              href={`/command-center/estimates/${est.id}` as Route}
              key={est.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-3 transition hover:border-[--color-blue-brand]/40 hover:bg-white"
            >
              <div>
                <p className="text-sm font-bold text-[--color-ink]">{est.name}</p>
                <p className="mt-0.5 text-xs text-[--color-ink-dim]">
                  Updated {new Date(est.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold text-[--color-ink]">
                  {est.total_cost != null ? `$${est.total_cost.toLocaleString()}` : "Pending"}
                </p>
                <span
                  className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusBadgeClasses(est.status)}`}
                >
                  {formatStatus(est.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Invoices Tab (Coming Soon) ────────────────────────────────────────────────

function InvoicesTab() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--color-border] bg-[--color-surface-alt] py-14 text-center">
      <Receipt className="mb-3 h-8 w-8 text-[--color-ink-dim] opacity-30" />
      <p className="text-sm font-bold text-[--color-ink]">Invoicing Coming Soon</p>
      <p className="mt-1 max-w-xs text-xs text-[--color-ink-dim]">
        Create and send invoices directly from each customer profile. This feature is under development.
      </p>
    </div>
  );
}

// ─── Payments Tab (Coming Soon) ────────────────────────────────────────────────

function PaymentsTab() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--color-border] bg-[--color-surface-alt] py-14 text-center">
      <CreditCard className="mb-3 h-8 w-8 text-[--color-ink-dim] opacity-30" />
      <p className="text-sm font-bold text-[--color-ink]">Payments Coming Soon</p>
      <p className="mt-1 max-w-xs text-xs text-[--color-ink-dim]">
        Track payments and balances for each customer. Payment integration is planned for a future release.
      </p>
    </div>
  );
}

// ─── Schedule Tab (Coming Soon) ────────────────────────────────────────────────

function ScheduleTab() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--color-border] bg-[--color-surface-alt] py-14 text-center">
      <Calendar className="mb-3 h-8 w-8 text-[--color-ink-dim] opacity-30" />
      <p className="text-sm font-bold text-[--color-ink]">Schedule Coming Soon</p>
      <p className="mt-1 max-w-xs text-xs text-[--color-ink-dim]">
        Schedule jobs, set reminders, and coordinate work for this customer. Coming in a future update.
      </p>
    </div>
  );
}

// ─── Notes Section ─────────────────────────────────────────────────────────────

function NotesSection({ clientId, initialNotes }: { clientId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState<ClientNote[]>(() => {
    if (!initialNotes) return [];
    // Try parsing as JSON array (new format), fallback to legacy single string
    try {
      const parsed = JSON.parse(initialNotes);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Legacy: single text note
    }
    if (initialNotes.trim()) {
      return [{ id: "legacy", text: initialNotes, createdAt: new Date().toISOString() }];
    }
    return [];
  });
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const NOTES_PREVIEW_COUNT = 3;
  const visibleNotes = showAll ? notes : notes.slice(0, NOTES_PREVIEW_COUNT);

  const handleCreateNote = useCallback(async () => {
    const text = newNote.trim();
    if (!text) return;

    const note: ClientNote = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    setNewNote("");
    setSaving(true);

    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: JSON.stringify(updatedNotes) }),
      });
    } catch {
      // Silently fail — note is already in local state
    } finally {
      setSaving(false);
    }
  }, [newNote, notes, clientId]);

  return (
    <details open className="group rounded-2xl border border-[--color-border] bg-white shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between p-6 pb-0 group-open:pb-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
          <StickyNote className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Notes & Activity
        </h2>
        <span className="text-[10px] font-semibold text-[--color-ink-dim]">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
      </summary>

      <div className="px-6 pb-6">
        {/* New Note Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCreateNote();
              }
            }}
            placeholder="Add a note..."
            className="flex-1 h-10 rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-3 text-sm text-[--color-ink] placeholder:text-[--color-ink-dim] focus:border-[--color-blue-brand] focus:ring-1 focus:ring-[--color-blue-brand] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreateNote}
            disabled={!newNote.trim() || saving}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[--color-blue-brand] px-4 text-[11px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-[--color-blue-dark] disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Note
          </button>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <p className="text-sm text-[--color-ink-dim] italic">No notes added yet.</p>
        ) : (
          <div className="space-y-3">
            {visibleNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-3"
              >
                <p className="text-sm text-[--color-ink] whitespace-pre-wrap leading-relaxed">{note.text}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[--color-ink-dim]">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(new Date(note.createdAt))}
                </div>
              </div>
            ))}
            {notes.length > NOTES_PREVIEW_COUNT && !showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[--color-blue-brand] transition hover:bg-[--color-blue-brand]/5"
              >
                See {notes.length - NOTES_PREVIEW_COUNT} more note{notes.length - NOTES_PREVIEW_COUNT !== 1 ? "s" : ""}
              </button>
            )}
            {showAll && notes.length > NOTES_PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[--color-ink-dim] transition hover:text-[--color-blue-brand]"
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

// ─── Main Client Detail ────────────────────────────────────────────────────────

export function ClientDetailClient({ client, estimates }: { client: ClientDTO; estimates: ShortEstimate[] }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("estimates");

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Link
              href={routes.crm}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] transition hover:text-[--color-blue-brand]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to CRM
            </Link>
            <span className="text-[--color-ink-dim]">·</span>
            <Link
              href={routes.commandCenter}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] transition hover:text-[--color-blue-brand]"
            >
              Command Center
            </Link>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[--color-ink]">{client.name}</h1>
          <p className="mt-1 text-sm text-[--color-ink-mid]">
            Customer profile, estimates, and activity.
          </p>
        </div>
      </div>

      {/* Contact Info Card — collapsible */}
      <details open className="group rounded-2xl border border-[--color-border] bg-white shadow-sm">
        <summary className="cursor-pointer p-6 pb-0 group-open:pb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">Contact Info</h2>
        </summary>
        <div className="flex flex-wrap gap-6 px-6 pb-6">
          {client.phone ? (
            <div className="flex items-center gap-3 text-sm text-[--color-ink]">
              <Phone className="h-4 w-4 text-[--color-ink-dim]" /> {client.phone}
            </div>
          ) : (
            <span className="text-sm text-[--color-ink-dim] italic">No phone on file</span>
          )}
          {client.email ? (
            <div className="flex items-center gap-3 text-sm text-[--color-ink]">
              <Mail className="h-4 w-4 text-[--color-ink-dim]" /> {client.email}
            </div>
          ) : null}
          {client.address ? (
            <div className="flex items-start gap-3 text-sm text-[--color-ink]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[--color-ink-dim]" /> {client.address}
            </div>
          ) : null}
        </div>
      </details>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl border border-[--color-border] bg-[--color-surface-alt] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] transition ${
              activeTab === id
                ? "bg-white text-[--color-blue-brand] shadow-sm"
                : "text-[--color-ink-mid] hover:text-[--color-ink]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content — collapsible */}
      <details open className="group rounded-2xl border border-[--color-border] bg-white shadow-sm">
        <summary className="cursor-pointer p-6 pb-0 group-open:pb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">
            {TABS.find((t) => t.id === activeTab)?.label ?? "Details"}
          </h2>
        </summary>
        <div className="px-6 pb-6">
          {activeTab === "estimates" && <EstimatesTab clientId={client.id} estimates={estimates} />}
          {activeTab === "invoices" && <InvoicesTab />}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "schedule" && <ScheduleTab />}
        </div>
      </details>

      {/* Notes Section */}
      <NotesSection clientId={client.id} initialNotes={client.notes} />
    </div>
  );
}
