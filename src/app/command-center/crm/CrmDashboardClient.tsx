"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Search, Plus, Phone, Mail, MapPin, MoreHorizontal, ArrowRight, ArrowLeft } from "lucide-react";
import type { ClientDTO } from "@/lib/dal/clients";
import { ClientFormModal } from "./ClientFormModal";
import type { Route } from "next";
import { routes } from "@routes";

export function CrmDashboardClient({ initialClients }: { initialClients: ClientDTO[] }) {
  const [clients, setClients] = useState<ClientDTO[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDTO | null>(null);

  const filteredClients = clients.filter((client) => {
    const haystack = [client.name, client.email, client.phone, client.address].join(" ").toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const handleCreateNew = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (client: ClientDTO) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleSave = (savedClient: ClientDTO) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === savedClient.id ? savedClient : c));
    } else {
      setClients([savedClient, ...clients]);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={routes.commandCenter}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] transition hover:text-[--color-blue-brand] mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Command Center
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--color-blue-brand]">
            Command Center
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase text-[--color-ink]">CRM & Clients</h1>
          <p className="mt-2 text-sm text-[--color-ink-mid]">
            Manage your customers and build your book of business.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[--color-blue-brand] px-6 text-sm font-black uppercase tracking-[0.08em] text-white shadow-md transition hover:bg-[--color-blue-dark]"
        >
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      <div className="flex-1 rounded-2xl border border-[--color-border] bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="relative flex-1 max-w-md text-[--color-ink-dim]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <input
              type="text"
              placeholder="Search clients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[--color-border] bg-[--color-surface-alt] py-2 pl-9 pr-4 text-sm text-[--color-ink] placeholder:text-[--color-ink-dim] focus:border-[--color-blue-brand] focus:ring-1 focus:ring-[--color-blue-brand]"
            />
          </label>
          <div className="text-sm font-semibold text-[--color-ink-dim]">
            {filteredClients.length} {filteredClients.length === 1 ? "client" : "clients"} match
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-[--color-border] bg-[--color-surface-alt] p-6 text-center">
            <Users className="h-8 w-8 text-[--color-ink-dim] mb-3" />
            <h3 className="text-sm font-bold text-[--color-ink]">No clients found</h3>
            <p className="mt-1 text-sm text-[--color-ink-dim]">
              {searchQuery ? "Try a different search term." : "Get started by adding your first client."}
            </p>
            {!searchQuery && (
              <button 
                onClick={handleCreateNew}
                className="mt-4 text-sm font-bold text-[--color-blue-brand] hover:underline"
              >
                + Add Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                className="group relative flex flex-col justify-between rounded-xl border border-[--color-border] bg-white p-5 transition hover:border-[--color-blue-brand]/30 hover:shadow-sm"
              >
                <div className="absolute right-4 top-4">
                  <button 
                    onClick={() => handleEdit(client)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[--color-ink-dim] transition hover:border-[--color-border] hover:bg-[--color-surface-alt] hover:text-[--color-ink]"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                
                <div>
                  <h3 className="pr-8 text-lg font-black text-[--color-ink]">{client.name}</h3>
                  <div className="mt-3 flex flex-col gap-2">
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-[--color-ink-mid]">
                        <Phone className="h-3.5 w-3.5 text-[--color-ink-dim]" />
                        {client.phone}
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-[--color-ink-mid]">
                        <Mail className="h-3.5 w-3.5 text-[--color-ink-dim]" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-start gap-2 text-sm text-[--color-ink-mid]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[--color-ink-dim]" />
                        <span className="line-clamp-2">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-[--color-border] pt-4">
                  <Link 
                    href={`/command-center/crm/${client.id}` as Route}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[--color-blue-brand] transition hover:text-[--color-blue-dark]"
                  >
                    View History
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <ClientFormModal 
          client={editingClient} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
