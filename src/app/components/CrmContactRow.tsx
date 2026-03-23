"use client";

import type { CrmContact } from "@/lib/crm/types";

export function CrmContactRow({ contact }: { contact: CrmContact }) {
  return (
    <tr className="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
      <td className="px-4 py-3 font-medium text-[--color-ink]">{contact.name}</td>
      <td className="px-4 py-3 text-[--color-ink-mid]">{contact.email}</td>
      <td className="px-4 py-3 text-[--color-ink-mid]">{contact.phone ?? "—"}</td>
      <td className="px-4 py-3 text-[--color-ink-mid]">{contact.company ?? "—"}</td>
      <td className="px-4 py-3 text-sm text-[--color-ink-dim]">{contact.notes ?? "—"}</td>
    </tr>
  );
}
