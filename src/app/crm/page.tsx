"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { CrmContact } from "@/lib/crm/types";
import { CrmContactRow } from "@/app/components/CrmContactRow";

export default function CrmPage() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      // First try to hit the Supabase table (which might not exist yet)
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*");

      if (error || !data) {
        // Fallback to static API endpoint for now
        try {
          const resp = await fetch("/api/crm/contacts");
          const demo = await resp.json();
          setContacts(demo);
        } catch (err) {
          console.error("Failed to load contacts:", err);
        }
      } else {
        setContacts(data as CrmContact[]);
      }
      setLoading(false);
    }
    fetchContacts();
  }, []);

  return (
    <section className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[--color-ink]">
            Customers & Jobs
          </h1>
          <p className="mt-2 text-[--color-ink-mid]">
            Manage client records, link estimates to contacts, and track job status. (Beta)
          </p>
        </div>
        <button className="rounded-xl border border-[--color-blue-brand]/40 bg-[--color-blue-brand] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[--color-blue-dark]">
          + Add Contact
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-[--color-border] bg-white">
          <p className="text-sm font-medium text-[--color-ink-mid]">Loading CRM data...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[--color-border] bg-white p-12 text-center shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-[--color-ink]">No Contacts Found</h3>
          <p className="max-w-md text-sm text-[--color-ink-mid]">
            You haven't added any customers yet. Add a contact or link an estimate to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[--color-border] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-[--color-surface-alt] text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-ink-dim]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <CrmContactRow key={c.id} contact={c} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
