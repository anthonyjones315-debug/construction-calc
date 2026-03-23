"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import type { ClientDTO } from "@/lib/dal/clients";

type ClientFormModalProps = {
  client: ClientDTO | null;
  onClose: () => void;
  onSave: (client: ClientDTO) => void;
};

export function ClientFormModal({ client, onClose, onSave }: ClientFormModalProps) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    notes: client?.notes || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!client;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Name is required.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const url = isEditing && client
        ? `/api/clients/${client.id}`
        : "/api/clients";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save client.");
      }

      const savedClient = await res.json();
      onSave(savedClient);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-black uppercase tracking-tight text-[--color-ink]">
          {isEditing ? "Edit Client" : "New Client"}
        </h2>
        <p className="mt-1 text-sm text-[--color-ink-mid]">
          {isEditing ? "Update customer details below." : "Add a new customer to your CRM."}
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink-dim]">
            Full Name or Company *
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 text-sm font-medium normal-case text-[--color-ink] transition focus:border-[--color-blue-brand] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[--color-blue-brand]"
              placeholder="e.g. Acme Corp"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink-dim]">
              Phone Number
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 text-sm font-medium normal-case text-[--color-ink] transition focus:border-[--color-blue-brand] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[--color-blue-brand]"
                placeholder="(555) 123-4567"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink-dim]">
              Email Address
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 text-sm font-medium normal-case text-[--color-ink] transition focus:border-[--color-blue-brand] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[--color-blue-brand]"
                placeholder="contact@acme.com"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink-dim]">
            Address / Primary Job Site
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-11 rounded-lg border border-[--color-border] bg-[--color-surface-alt] px-3 text-sm font-medium normal-case text-[--color-ink] transition focus:border-[--color-blue-brand] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[--color-blue-brand]"
              placeholder="123 Main St, City, ST 12345"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink-dim]">
            Internal Notes
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] p-3 text-sm font-medium normal-case text-[--color-ink] transition focus:border-[--color-blue-brand] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[--color-blue-brand]"
              placeholder="Preferences, gate codes, or special instructions..."
            />
          </label>

          <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-[--color-border]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-[--color-ink-mid] transition hover:bg-[--color-surface-alt]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[--color-blue-brand] px-5 text-sm font-black uppercase tracking-[0.05em] text-white shadow-sm transition hover:bg-[--color-blue-dark] disabled:opacity-50"
            >
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
