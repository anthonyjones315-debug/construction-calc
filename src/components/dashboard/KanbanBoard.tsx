"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User, DollarSign, Calendar } from "lucide-react";

/* ──────────────────────── types ──────────────────────── */

const COLUMNS = [
  { id: "lead", label: "Lead", color: "#64748b" },
  { id: "quoted", label: "Estimate Out", color: "#3b82f6" },
  { id: "scheduled", label: "Scheduled", color: "#f59e0b" },
  { id: "in_progress", label: "In Progress", color: "#8b5cf6" },
  { id: "completed", label: "Invoiced", color: "#22c55e" },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

export type KanbanProject = {
  id: string;
  name: string;
  status: string;
  customerName?: string | null;
  pipelineValue?: string | null;
  startDate?: string | null;
};

type Props = {
  projects: KanbanProject[];
  onStatusChange?: (projectId: string, newStatus: string) => void;
};

/* ──────────────────── sortable card ──────────────────── */

function KanbanCard({ project }: { project: KanbanProject }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab rounded p-0.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <div className="ml-4">
        <p className="text-xs font-semibold text-slate-800 truncate">
          {project.name}
        </p>
        {project.customerName && (
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 truncate">
            <User className="h-2.5 w-2.5" />
            {project.customerName}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          {project.pipelineValue && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
              <DollarSign className="h-2.5 w-2.5" />
              {project.pipelineValue}
            </span>
          )}
          {project.startDate && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Calendar className="h-2.5 w-2.5" />
              {project.startDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── column ──────────────────── */

function KanbanColumn({
  column,
  items,
}: {
  column: (typeof COLUMNS)[number];
  items: KanbanProject[];
}) {
  return (
    <div className="flex min-h-[220px] w-[160px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-2 sm:min-h-[320px] sm:w-full sm:min-w-[180px] snap-start">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {column.label}
        </span>
        <span className="ml-auto rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
          {items.length}
        </span>
      </div>
      <SortableContext
        items={items.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
          {items.map((project) => (
            <KanbanCard key={project.id} project={project} />
          ))}
          {items.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-300">
                Drop here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

/* ──────────────────── board ──────────────────── */

export function KanbanBoard({ projects, onStatusChange }: Props) {
  const [items, setItems] = useState(projects);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const grouped = useMemo(() => {
    const map = new Map<string, KanbanProject[]>();
    for (const col of COLUMNS) map.set(col.id, []);
    for (const item of items) {
      const list = map.get(item.status) ?? map.get("lead")!;
      list.push(item);
    }
    return map;
  }, [items]);

  const activeProject = useMemo(
    () => items.find((p) => p.id === activeId) ?? null,
    [items, activeId],
  );

  const findColumn = useCallback(
    (id: string): ColumnId => {
      for (const [col, list] of grouped) {
        if (col === id) return col as ColumnId;
        if (list.some((p) => p.id === id)) return col as ColumnId;
      }
      return "lead";
    },
    [grouped],
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over) return;

      const overId = String(over.id);
      let newStatus: ColumnId;

      // Dropped on a column directly
      if (COLUMNS.some((c) => c.id === overId)) {
        newStatus = overId as ColumnId;
      } else {
        newStatus = findColumn(overId);
      }

      const projectId = String(active.id);
      const oldStatus = findColumn(projectId);
      if (oldStatus === newStatus) return;

      setItems((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: newStatus } : p,
        ),
      );

      onStatusChange?.(projectId, newStatus);
    },
    [findColumn, onStatusChange],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            items={grouped.get(col.id) ?? []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeProject ? <KanbanCard project={activeProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
