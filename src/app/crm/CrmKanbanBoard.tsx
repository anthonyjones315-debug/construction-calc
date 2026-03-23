"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { CrmContact } from "@/lib/crm/types";
import { ArrowRight, MoreHorizontal, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";

type ColumnId = "Lead" | "Estimate Sent" | "Active" | "Invoiced" | "Completed";

const COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: "Lead", title: "Leads", color: "bg-slate-100 border-slate-200" },
  { id: "Estimate Sent", title: "Estimate Sent", color: "bg-blue-50 border-blue-200" },
  { id: "Active", title: "Active Jobs", color: "bg-amber-50 border-amber-200" },
  { id: "Invoiced", title: "Invoiced", color: "bg-purple-50 border-purple-200" },
  { id: "Completed", title: "Completed", color: "bg-emerald-50 border-emerald-200" }
];

export interface KanbanContact extends CrmContact {
  status: ColumnId;
}

export function CrmKanbanBoard({ initialContacts }: { initialContacts: CrmContact[] }) {
  // Initialize with a default status of "Lead" if not present
  const [contacts, setContacts] = useState<KanbanContact[]>([]);

  useEffect(() => {
    // In a real app we'd fetch the exact statuses from the DB. 
    // Here we map missing ones to "Lead" or distribute them for the demo.
    const mapped = initialContacts.map((c, i) => ({
      ...c,
      status: (c as unknown as KanbanContact).status || (i % 2 === 0 ? "Lead" : "Estimate Sent")
    })) as KanbanContact[];
    setContacts(mapped);
  }, [initialContacts]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Move contact
    setContacts(prev => {
      const newContacts = [...prev];
      const contactIndex = newContacts.findIndex(c => c.id === draggableId);
      if (contactIndex > -1) {
        newContacts[contactIndex] = { ...newContacts[contactIndex], status: destination.droppableId as ColumnId };
      }
      return newContacts;
    });

    // TODO: Await `supabase.from('crm_contacts').update({ status: destination.droppableId }).eq('id', draggableId)`
  };

  const advanceContact = (contactId: string) => {
    setContacts(prev => {
      const newContacts = [...prev];
      const index = newContacts.findIndex(c => c.id === contactId);
      if (index > -1) {
        const currentIdx = COLUMNS.findIndex(col => col.id === newContacts[index].status);
        if (currentIdx < COLUMNS.length - 1) {
          newContacts[index].status = COLUMNS[currentIdx + 1].id;
        }
      }
      return newContacts;
    });
  };

  return (
    <div className="w-full h-full min-h-[600px] overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 items-start h-full">
          {COLUMNS.map((col) => {
            const columnContacts = contacts.filter(c => c.status === col.id);

            return (
              <div key={col.id} className={`flex-shrink-0 w-[300px] flex flex-col rounded-xl border ${col.color} bg-opacity-40`}>
                <div className="p-3 border-b border-inherit bg-white/50 flex justify-between items-center rounded-t-xl">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">{col.title}</h3>
                  <span className="text-xs font-semibold bg-white border px-2 py-0.5 rounded-full text-slate-500">
                    {columnContacts.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? "bg-white/20" : ""}`}
                    >
                      {columnContacts.map((contact, index) => (
                        <Draggable key={contact.id} draggableId={contact.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white border rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? "shadow-xl ring-2 ring-[--color-blue-brand]" : "border-slate-200"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900 text-sm">{contact.name}</h4>
                                <button className="text-slate-400 hover:text-slate-600">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {contact.company && (
                                <p className="text-xs text-slate-500 font-semibold mb-2">{contact.company}</p>
                              )}
                              
                              <div className="flex flex-col gap-1.5 mb-4">
                                {contact.email && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Mail className="w-3 h-3" /> <span className="truncate">{contact.email}</span>
                                  </div>
                                )}
                                {contact.phone && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Phone className="w-3 h-3" /> <span>{contact.phone}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                {col.id === "Active" ? (
                                  <button className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1 hover:bg-amber-100 transition">
                                    <CalendarIcon className="w-3 h-3" /> Schedule
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Added recently</span>
                                )}

                                {col.id !== "Completed" && (
                                  <button 
                                    onClick={() => advanceContact(contact.id)}
                                    title="Advance to next stage" 
                                    className="p-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-[--color-blue-brand] hover:border-[--color-blue-brand] transition"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
