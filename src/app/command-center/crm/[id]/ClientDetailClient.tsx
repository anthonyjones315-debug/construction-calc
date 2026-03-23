"use client";

import Link from "next/link";
import { ArrowLeft, FileText, MapPin, Mail, Phone } from "lucide-react";
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

export function ClientDetailClient({ client, estimates }: { client: ClientDTO; estimates: ShortEstimate[] }) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href={routes.crm} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] transition hover:text-[--color-blue-brand] mb-3">
             <ArrowLeft className="h-3.5 w-3.5" /> Back to CRM
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[--color-ink]">{client.name}</h1>
          <p className="mt-1 text-sm text-[--color-ink-mid]">
            Customer details, history, and active jobs.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,2fr]">
        <article className="rounded-2xl border border-[--color-border] bg-white p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">Contact Info</h2>
          <div className="flex flex-col gap-3">
            {client.phone ? (
               <div className="flex items-center gap-3 text-sm text-[--color-ink]">
                  <Phone className="h-4 w-4 text-[--color-ink-dim]" /> {client.phone}
               </div>
            ) : <span className="text-sm text-[--color-ink-dim] italic">No phone on file</span>}
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
          
          <div className="mt-4 border-t border-[--color-border] pt-4">
             <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[--color-ink-dim] mb-2">Internal Notes</h3>
             <p className="text-sm text-[--color-ink-mid] whitespace-pre-wrap leading-relaxed">{client.notes || "No notes added."}</p>
          </div>
        </article>

        <article className="rounded-2xl border border-[--color-border] bg-white p-6 shadow-sm flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]">Job History & Estimates</h2>
           </div>
           
           {estimates.length === 0 ? (
             <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[--color-border] bg-[--color-surface-alt] py-8 text-center text-sm text-[--color-ink-dim]">
               <FileText className="mb-2 h-6 w-6 opacity-30" />
               No estimates attached to this client yet. <br /> Create a new estimate and select this client to link them.
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
                     <p className="mt-0.5 text-xs text-[--color-ink-dim]">Updated {new Date(est.updated_at).toLocaleDateString()}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-mono font-bold text-[--color-ink]">
                       {est.total_cost != null ? `$${est.total_cost.toLocaleString()}` : "Pending"}
                     </p>
                     <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[--color-ink-dim]">{est.status || "Draft"}</p>
                   </div>
                 </Link>
               ))}
             </div>
           )}
        </article>
      </div>
    </div>
  );
}
