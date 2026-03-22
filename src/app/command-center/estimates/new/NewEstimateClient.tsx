"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  BookOpen,
  PenLine,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  Send,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { useEstimateForm } from "@/lib/estimates/useEstimateForm";
import {
  EstimateSignaturePad,
  type EstimateSignaturePadRef,
} from "@/components/estimates/SignaturePad";
import { routes } from "@routes";
import type {
  EstimateLineItem,
  PriceBookMaterial,
} from "@/lib/estimates/new-estimate-types";
import type { EstimateCartItem } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const UNIT_OPTIONS = [
  "ea",
  "sq ft",
  "cu yd",
  "lf",
  "bag",
  "bundle",
  "sheet",
  "gal",
  "box",
  "hr",
  "day",
  "ton",
  "lb",
  "ft",
];

const TAX_COUNTIES = [
  { county: "", label: "No Tax (0%)", rate: 0 },
  { county: "oneida", label: "Oneida County (8.75%)", rate: 8.75 },
  { county: "herkimer", label: "Herkimer County (8.25%)", rate: 8.25 },
  { county: "madison", label: "Madison County (8.00%)", rate: 8.0 },
  { county: "custom", label: "Custom Rate…", rate: 0 },
] as const;

type PanelTab = "calculator" | "pricebook" | "manual" | null;

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDollars(dollars: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// --- Estimate Details Card ---

interface EstimateDetailsCardProps {
  estimateName: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  jobSiteAddress: string;
  estimateDate: string;
  controlNumber: string;
  estimateNotes: string;
  onChange: (field: string, value: string) => void;
}

function EstimateDetailsCard({
  estimateName,
  clientName,
  clientEmail,
  projectName,
  jobSiteAddress,
  estimateDate,
  controlNumber,
  estimateNotes,
  onChange,
}: EstimateDetailsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
          Estimate Details
        </p>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-slate-500">
          {controlNumber}
        </span>
      </div>

      {/* Estimate Name — full width */}
      <div className="mb-3">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Estimate Name
        </label>
        <input
          type="text"
          value={estimateName}
          onChange={(e) => onChange("estimateName", e.target.value)}
          placeholder="e.g. Kitchen Remodel – Johnson Residence"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
        />
      </div>

      {/* Two-column grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Client Name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => onChange("clientName", e.target.value)}
            placeholder="John Smith"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Client Email
          </label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => onChange("clientEmail", e.target.value)}
            placeholder="john@example.com"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => onChange("projectName", e.target.value)}
            placeholder="Kitchen Remodel"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Date
          </label>
          <input
            type="date"
            value={estimateDate}
            onChange={(e) => onChange("estimateDate", e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
          />
        </div>
      </div>

      {/* Job Site Address — full width */}
      <div className="mt-3">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Job Site Address
        </label>
        <input
          type="text"
          value={jobSiteAddress}
          onChange={(e) => onChange("jobSiteAddress", e.target.value)}
          placeholder="123 Main St, Utica, NY 13501"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
        />
      </div>

      {/* Notes — collapsible-ish */}
      <div className="mt-3">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Estimate Notes{" "}
          <span className="font-normal normal-case text-slate-400">
            (optional)
          </span>
        </label>
        <textarea
          value={estimateNotes}
          onChange={(e) => onChange("estimateNotes", e.target.value)}
          placeholder="Add any notes for the client or your team…"
          rows={2}
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
        />
      </div>
    </article>
  );
}

// --- Calculator Import Panel ---

interface CalculatorImportPanelProps {
  estimateCart: EstimateCartItem[];
  marketPrices: Record<string, { price: number; unit: string }>;
  onAddItems: (items: Omit<EstimateLineItem, "id">[]) => void;
}

function CalculatorImportPanel({
  estimateCart,
  marketPrices,
  onAddItems,
}: CalculatorImportPanelProps) {
  const [imported, setImported] = useState<Set<string>>(new Set());

  function mapCartItemToLineItems(
    cartItem: EstimateCartItem,
  ): Omit<EstimateLineItem, "id">[] {
    return cartItem.materialList.map((materialName) => {
      const priceEntry = marketPrices[materialName];
      return {
        description: materialName,
        quantity: cartItem.quantity,
        unit: priceEntry?.unit ?? "ea",
        unitPrice: priceEntry?.price ?? 0,
        notes: `From ${cartItem.calculatorLabel}`,
        source: "calculator" as const,
        calculatorId: cartItem.calculatorId,
        category: cartItem.calculatorLabel,
      };
    });
  }

  function handleImportCart(cartItem: EstimateCartItem) {
    const items = mapCartItemToLineItems(cartItem);
    onAddItems(items);
    setImported((prev) => new Set([...prev, cartItem.id]));
  }

  function handleImportAll() {
    const allItems = estimateCart.flatMap(mapCartItemToLineItems);
    onAddItems(allItems);
    setImported(new Set(estimateCart.map((item) => item.id)));
  }

  if (estimateCart.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
        <Calculator className="mx-auto mb-2 h-8 w-8 text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">
          No calculator results yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Run a calculator to generate materials, then import them here.
        </p>
        <Link
          href={routes.calculators}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-orange-brand px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[--color-orange-dark]"
        >
          Open Calculators
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          {estimateCart.length} result{estimateCart.length !== 1 ? "s" : ""} in
          cart
        </p>
        <button
          type="button"
          onClick={handleImportAll}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-brand px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[--color-orange-dark]"
        >
          <Plus className="h-3.5 w-3.5" />
          Import All
        </button>
      </div>

      {estimateCart.map((cartItem) => {
        const alreadyImported = imported.has(cartItem.id);
        return (
          <div
            key={cartItem.id}
            className={`rounded-xl border px-3 py-3 ${
              alreadyImported
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {cartItem.calculatorLabel}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {cartItem.primaryResult.value} {cartItem.primaryResult.unit} ·{" "}
                  {cartItem.materialList.length} material
                  {cartItem.materialList.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {cartItem.materialList.slice(0, 5).map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600"
                    >
                      {m}
                    </span>
                  ))}
                  {cartItem.materialList.length > 5 && (
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">
                      +{cartItem.materialList.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleImportCart(cartItem)}
                disabled={alreadyImported}
                className="ml-2 shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[--color-orange-brand]/45 hover:text-[--color-orange-dark] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {alreadyImported ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Price Book Panel ---

interface PriceBookPanelProps {
  materials: PriceBookMaterial[];
  loading: boolean;
  onAddItem: (item: Omit<EstimateLineItem, "id">) => void;
}

function PriceBookPanel({
  materials,
  loading,
  onAddItem,
}: PriceBookPanelProps) {
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    material_name: "",
    category: "",
    unit_type: "ea",
    unit_cost: "",
  });
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [addedMaterials, setAddedMaterials] = useState<PriceBookMaterial[]>([]);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());

  const allMaterials = [...materials, ...addedMaterials];

  const filtered = query.trim()
    ? allMaterials.filter(
        (m) =>
          m.material_name.toLowerCase().includes(query.toLowerCase()) ||
          m.category.toLowerCase().includes(query.toLowerCase()),
      )
    : allMaterials;

  // Group by category
  const grouped: Record<string, PriceBookMaterial[]> = {};
  for (const m of filtered) {
    const cat = m.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m);
  }

  function handleQuickAdd(m: PriceBookMaterial) {
    onAddItem({
      description: m.material_name,
      quantity: 1,
      unit: m.unit_type,
      unitPrice: m.unit_cost,
      notes: "",
      source: "pricebook",
      materialId: m.id,
      category: m.category,
    });
    setJustAdded((prev) => new Set([...prev, m.id]));
    setTimeout(() => {
      setJustAdded((prev) => {
        const next = new Set(prev);
        next.delete(m.id);
        return next;
      });
    }, 1500);
  }

  async function handleAddNewMaterial(e: FormEvent) {
    e.preventDefault();
    if (!addForm.material_name.trim()) return;
    setAddingMaterial(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material_name: addForm.material_name.trim(),
          category: addForm.category.trim() || "Other",
          unit_type: addForm.unit_type,
          unit_cost: parseFloat(addForm.unit_cost) || 0,
        }),
      });
      const json = (await res.json()) as { data?: PriceBookMaterial };
      if (res.ok && json.data) {
        setAddedMaterials((prev) => [...prev, json.data!]);
        // Immediately add to estimate
        handleQuickAdd(json.data);
        setAddForm({
          material_name: "",
          category: "",
          unit_type: "ea",
          unit_cost: "",
        });
        setShowAddForm(false);
      }
    } finally {
      setAddingMaterial(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span className="text-sm">Loading price book…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search materials…"
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
      />

      {/* Material list */}
      {filtered.length === 0 && !showAddForm ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
          {query
            ? "No materials match your search."
            : "Your price book is empty. Add your first material below."}
        </p>
      ) : (
        <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="sticky top-0 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {category}
              </p>
              {items.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 hover:bg-[--color-orange-soft]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {m.material_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDollars(m.unit_cost)} / {m.unit_type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(m)}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      justAdded.has(m.id)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[--color-orange-brand]/12 text-[--color-orange-dark] hover:bg-[--color-orange-brand]/15"
                    }`}
                  >
                    {justAdded.has(m.id) ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {justAdded.has(m.id) ? "Added" : "Add"}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Add New Material form */}
      {showAddForm ? (
        <form
          onSubmit={handleAddNewMaterial}
          className="space-y-2 rounded-xl border border-[--color-orange-rim] bg-[--color-orange-soft] p-3"
        >
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[--color-orange-dark]">
            New Material
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={addForm.material_name}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, material_name: e.target.value }))
              }
              placeholder="Material name"
              required
              className="col-span-2 h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-[--color-orange-brand]/45 focus:outline-none"
            />
            <input
              type="text"
              value={addForm.category}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, category: e.target.value }))
              }
              placeholder="Category (optional)"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-[--color-orange-brand]/45 focus:outline-none"
            />
            <select
              value={addForm.unit_type}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, unit_type: e.target.value }))
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-[--color-orange-brand]/45 focus:outline-none"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={addForm.unit_cost}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, unit_cost: e.target.value }))
              }
              placeholder="Unit cost $"
              step="0.01"
              min="0"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-[--color-orange-brand]/45 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addingMaterial || !addForm.material_name.trim()}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-orange-brand px-3 text-xs font-bold text-white transition hover:bg-[--color-orange-dark] disabled:opacity-50"
              >
                {addingMaterial ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[--color-orange-rim] hover:text-[--color-orange-dark]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add New Material to Price Book
        </button>
      )}
    </div>
  );
}

// --- Manual Entry Form ---

interface ManualEntryFormProps {
  onAdd: (item: Omit<EstimateLineItem, "id">) => void;
}

function ManualEntryForm({ onAdd }: ManualEntryFormProps) {
  const descRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    description: "",
    quantity: "",
    unit: "ea",
    unitPrice: "",
    notes: "",
  });

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const desc = form.description.trim();
    if (!desc) return;
    const qty = parseFloat(form.quantity) || 1;
    const price = parseFloat(form.unitPrice) || 0;
    onAdd({
      description: desc,
      quantity: qty,
      unit: form.unit,
      unitPrice: price,
      notes: form.notes.trim(),
      source: "manual",
    });
    setForm({
      description: "",
      quantity: "",
      unit: "ea",
      unitPrice: "",
      notes: "",
    });
    descRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Description row */}
      <div className="grid gap-2 sm:grid-cols-[1fr_100px_120px_120px]">
        <input
          ref={descRef}
          type="text"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          onKeyDown={handleKeyDown}
          placeholder="Description"
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
        />
        <input
          type="number"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          onKeyDown={handleKeyDown}
          placeholder="Qty"
          min="0"
          step="any"
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
        />
        <select
          value={form.unit}
          onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
            $
          </span>
          <input
            type="number"
            value={form.unitPrice}
            onChange={(e) =>
              setForm((p) => ({ ...p, unitPrice: e.target.value }))
            }
            onKeyDown={handleKeyDown}
            placeholder="Unit Price"
            min="0"
            step="0.01"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-6 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
          />
        </div>
      </div>
      {/* Notes + Add button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          onKeyDown={handleKeyDown}
          placeholder="Notes (optional)"
          className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
        />
        <button
          type="submit"
          disabled={!form.description.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-orange-brand px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[--color-orange-dark] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      <p className="text-[10px] text-slate-400">
        Press{" "}
        <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono">
          Enter
        </kbd>{" "}
        to add quickly
      </p>
    </form>
  );
}

// --- Add Item Panel (Segmented Control + Panels) ---

interface AddItemPanelProps {
  estimateCart: EstimateCartItem[];
  marketPrices: Record<string, { price: number; unit: string }>;
  materials: PriceBookMaterial[];
  loadingMaterials: boolean;
  onAddItems: (items: Omit<EstimateLineItem, "id">[]) => void;
}

function AddItemPanel({
  estimateCart,
  marketPrices,
  materials,
  loadingMaterials,
  onAddItems,
}: AddItemPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>(null);

  const tabs: {
    id: Exclude<PanelTab, null>;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: "calculator",
      label: "Calculator",
      icon: Calculator,
      badge: estimateCart.length || undefined,
    },
    { id: "pricebook", label: "Price Book", icon: BookOpen },
    { id: "manual", label: "Manual", icon: PenLine },
  ];

  function toggleTab(tab: Exclude<PanelTab, null>) {
    setActiveTab((prev) => (prev === tab ? null : tab));
  }

  return (
    <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
        Add Line Items
      </p>

      {/* Segmented control */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleTab(id)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
              activeTab === id
                ? "bg-white text-[--color-orange-dark] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
            {badge ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-brand text-[9px] font-black text-white">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {activeTab ? (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          {activeTab === "calculator" && (
            <CalculatorImportPanel
              estimateCart={estimateCart}
              marketPrices={marketPrices}
              onAddItems={onAddItems}
            />
          )}
          {activeTab === "pricebook" && (
            <PriceBookPanel
              materials={materials}
              loading={loadingMaterials}
              onAddItem={(item) => onAddItems([item])}
            />
          )}
          {activeTab === "manual" && (
            <ManualEntryForm onAdd={(item) => onAddItems([item])} />
          )}
        </div>
      ) : null}
    </article>
  );
}

// --- Line Items Card ---

interface LineItemsCardProps {
  lineItems: EstimateLineItem[];
  onUpdate: (id: string, patch: Partial<EstimateLineItem>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function LineItemsCard({
  lineItems,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LineItemsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-300 bg-white shadow-sm">
      <div className="px-4 pt-4 sm:px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
          Line Items{" "}
          {lineItems.length > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[--color-orange-brand]/12 px-1 text-[9px] text-[--color-orange-dark]">
              {lineItems.length}
            </span>
          )}
        </p>
      </div>

      {lineItems.length === 0 ? (
        <div className="px-4 pb-6 pt-4 text-center sm:px-5">
          <p className="text-sm text-slate-500">No line items yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Use the &ldquo;Add Line Items&rdquo; panel above to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50">
                  <th className="py-2 pl-5 pr-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    #
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Description
                  </th>
                  <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Qty
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Unit
                  </th>
                  <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Unit Price
                  </th>
                  <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Total
                  </th>
                  <th className="py-2 pl-2 pr-5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-2 pl-5 pr-2 text-[11px] font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onUpdate(item.id, { description: e.target.value })
                          }
                          className="w-full min-w-[140px] rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm text-slate-900 focus:border-[--color-orange-rim] focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          min="0"
                          step="any"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onUpdate(item.id, {
                              quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-right text-sm text-slate-900 focus:border-[--color-orange-rim] focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.unit}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            onUpdate(item.id, { unit: e.target.value })
                          }
                          className="rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm text-slate-900 focus:border-[--color-orange-rim] focus:bg-white focus:outline-none"
                        >
                          {UNIT_OPTIONS.includes(item.unit) ? null : (
                            <option value={item.unit}>{item.unit}</option>
                          )}
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-1.5 flex items-center text-xs text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={item.unitPrice}
                            min="0"
                            step="0.01"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onUpdate(item.id, {
                                unitPrice: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-24 rounded-lg border border-transparent bg-transparent pl-4 pr-1.5 py-1 text-right text-sm text-slate-900 focus:border-[--color-orange-rim] focus:bg-white focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-sm font-semibold text-slate-900">
                        {formatDollars(lineTotal)}
                      </td>
                      <td className="py-2 pl-2 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onMoveUp(idx)}
                            disabled={idx === 0}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveDown(idx)}
                            disabled={idx === lineItems.length - 1}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="mt-3 space-y-2 px-4 pb-4 sm:hidden sm:px-5">
            {lineItems.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {formatDollars(lineTotal)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onUpdate(item.id, { description: e.target.value })
                    }
                    className="mb-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-[--color-orange-rim] focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      min="0"
                      step="any"
                      placeholder="Qty"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdate(item.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-[--color-orange-rim] focus:outline-none"
                    />
                    <select
                      value={item.unit}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        onUpdate(item.id, { unit: e.target.value })
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:border-[--color-orange-rim] focus:outline-none"
                    >
                      {UNIT_OPTIONS.includes(item.unit) ? null : (
                        <option value={item.unit}>{item.unit}</option>
                      )}
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          onUpdate(item.id, {
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-5 pr-2.5 text-sm text-slate-900 focus:border-[--color-orange-rim] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onMoveUp(idx)}
                      disabled={idx === 0}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveDown(idx)}
                      disabled={idx === lineItems.length - 1}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </article>
  );
}

// --- Totals Card ---

interface TotalsCardProps {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxRatePercent: number;
  taxCounty: string;
  onTaxChange: (county: string, rate: number) => void;
}

function TotalsCard({
  subtotalCents,
  taxCents,
  totalCents,
  taxRatePercent,
  taxCounty,
  onTaxChange,
}: TotalsCardProps) {
  const [customRate, setCustomRate] = useState(
    String(taxRatePercent > 0 && taxCounty === "custom" ? taxRatePercent : ""),
  );

  const selectedPreset =
    TAX_COUNTIES.find((t) => t.county === taxCounty) ?? TAX_COUNTIES[0];

  function handlePresetChange(e: ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "custom") {
      onTaxChange("custom", parseFloat(customRate) || 0);
    } else {
      const preset = TAX_COUNTIES.find((t) => t.county === val);
      if (preset) onTaxChange(preset.county, preset.rate);
    }
  }

  function handleCustomRateChange(e: ChangeEvent<HTMLInputElement>) {
    setCustomRate(e.target.value);
    onTaxChange("custom", parseFloat(e.target.value) || 0);
  }

  return (
    <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {/* Tax selector */}
        <div className="flex items-center gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Tax
            </label>
            <select
              value={taxCounty || ""}
              onChange={handlePresetChange}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none"
            >
              {TAX_COUNTIES.map((t) => (
                <option key={t.county} value={t.county}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {taxCounty === "custom" && (
            <div className="mt-5 flex items-center gap-1.5">
              <input
                type="number"
                value={customRate}
                onChange={handleCustomRateChange}
                placeholder="0.00"
                min="0"
                max="25"
                step="0.01"
                className="h-9 w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-[--color-orange-brand]/45 focus:outline-none"
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
          )}
        </div>

        {/* Totals breakdown */}
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-between gap-12 sm:justify-end">
            <span className="text-xs text-slate-500">Subtotal</span>
            <span className="font-mono text-sm font-semibold text-slate-900">
              {formatCents(subtotalCents)}
            </span>
          </div>
          {taxCents > 0 && (
            <div className="flex items-center justify-between gap-12 sm:justify-end">
              <span className="text-xs text-slate-500">
                Tax (
                {selectedPreset?.county === "custom"
                  ? `${taxRatePercent}%`
                  : selectedPreset?.label}
                )
              </span>
              <span className="font-mono text-sm text-slate-700">
                {formatCents(taxCents)}
              </span>
            </div>
          )}
          <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between gap-12 sm:justify-end">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-700">
              Total
            </span>
            <span className="font-mono text-xl font-black text-[--color-orange-dark]">
              {formatCents(totalCents)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// --- Action Bar ---

interface ActionBarProps {
  onSaveDraft: () => Promise<void>;
  onGeneratePdf: () => Promise<void>;
  onSendToClient: () => Promise<void>;
  saving: boolean;
  generatingPdf: boolean;
  sending: boolean;
  hasLineItems: boolean;
  hasClientEmail: boolean;
}

function ActionBar({
  onSaveDraft,
  onGeneratePdf,
  onSendToClient,
  saving,
  generatingPdf,
  sending,
  hasLineItems,
  hasClientEmail,
}: ActionBarProps) {
  return (
    <div className="sticky bottom-0 z-10 rounded-t-2xl border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:static sm:rounded-2xl sm:border sm:border-slate-300 sm:shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-brand px-4 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-[--color-orange-dark] disabled:opacity-60 sm:flex-none sm:px-6"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving…" : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={onGeneratePdf}
          disabled={generatingPdf || !hasLineItems}
          title={!hasLineItems ? "Add line items first" : undefined}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-700 transition hover:border-[--color-orange-rim] hover:text-[--color-orange-dark] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-6"
        >
          {generatingPdf ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {generatingPdf ? "Generating…" : "Generate PDF"}
        </button>

        <button
          type="button"
          onClick={onSendToClient}
          disabled={sending || !hasLineItems || !hasClientEmail}
          title={
            !hasClientEmail
              ? "Enter a client email address first"
              : !hasLineItems
                ? "Add line items first"
                : undefined
          }
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-700 transition hover:border-[--color-orange-rim] hover:text-[--color-orange-dark] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-6"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {sending ? "Sending…" : "Send to Client"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function NewEstimateClient() {
  const router = useRouter();
  const {
    state,
    dispatch,
    totals,
    isDirty,
    saving,
    generatingPdf,
    error,
    successMessage,
    setError,
    saveDraft,
    finalize,
    generatePdf,
    estimateCart,
    marketPrices,
  } = useEstimateForm();

  const [materials, setMaterials] = useState<PriceBookMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const sigPadRef = useRef<EstimateSignaturePadRef>(null);

  // Fetch price book materials on mount
  useEffect(() => {
    setLoadingMaterials(true);
    fetch("/api/materials")
      .then((r) => r.json())
      .then((j: { data?: PriceBookMaterial[] }) => setMaterials(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingMaterials(false));
  }, []);

  // Dirty state warning on unload
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Helpers
  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      dispatch({
        type: "SET_FIELD",
        field: field as keyof typeof state,
        value,
      });
    },
    [dispatch],
  );

  const handleAddItems = useCallback(
    (items: Omit<EstimateLineItem, "id">[]) => {
      dispatch({ type: "ADD_LINE_ITEMS", items });
    },
    [dispatch],
  );

  const handleUpdateItem = useCallback(
    (id: string, patch: Partial<EstimateLineItem>) => {
      dispatch({ type: "UPDATE_LINE_ITEM", id, patch });
    },
    [dispatch],
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_LINE_ITEM", id });
    },
    [dispatch],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      dispatch({
        type: "REORDER_LINE_ITEMS",
        fromIndex: index,
        toIndex: index - 1,
      });
    },
    [dispatch],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= state.lineItems.length - 1) return;
      dispatch({
        type: "REORDER_LINE_ITEMS",
        fromIndex: index,
        toIndex: index + 1,
      });
    },
    [dispatch, state.lineItems.length],
  );

  const handleTaxChange = useCallback(
    (county: string, rate: number) => {
      dispatch({ type: "SET_TAX", county, ratePercent: rate });
    },
    [dispatch],
  );

  async function handleSaveDraft() {
    await saveDraft();
  }

  async function handleGeneratePdf() {
    await generatePdf();
  }

  async function handleSendToClient() {
    if (!state.clientEmail) {
      setError("Enter a client email address before sending.");
      return;
    }
    if (state.lineItems.length === 0) {
      setError("Add at least one line item before sending.");
      return;
    }
    // Show contractor signing modal before sending
    setShowSignModal(true);
  }

  async function handleSignAndSend() {
    const pad = sigPadRef.current;
    if (!pad || pad.isEmpty()) {
      setError("Please sign before sending the estimate to the client.");
      return;
    }
    const contractorSig = pad.getDataUrl();
    setShowSignModal(false);
    setSending(true);
    try {
      const result = await finalize(contractorSig);
      if (result?.id) {
        router.push(`/command-center/estimates/${result.id}`);
      }
    } finally {
      setSending(false);
    }
  }

  function handleSkipSignature() {
    setShowSignModal(false);
    setSending(true);
    finalize()
      .then((result) => {
        if (result?.id) {
          router.push(`/command-center/estimates/${result.id}`);
        }
      })
      .finally(() => setSending(false));
  }

  function handleDiscard() {
    if (isDirty) {
      const confirmed = window.confirm(
        "Discard this estimate? Any unsaved changes will be lost.",
      );
      if (!confirmed) return;
    }
    router.push(routes.commandCenter);
  }

  const hasLineItems = state.lineItems.length > 0;
  const hasClientEmail = state.clientEmail.trim().includes("@");

  return (
    <div className="space-y-3">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={routes.commandCenter}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-[--color-orange-dark]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Command Center
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand sm:text-sm">
            New Estimate
          </p>
          <button
            type="button"
            onClick={handleDiscard}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
            Discard
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="flex-1 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Success banner */}
      {successMessage ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-700">{successMessage}</p>
        </div>
      ) : null}

      {/* Estimate Details */}
      <EstimateDetailsCard
        estimateName={state.estimateName}
        clientName={state.clientName}
        clientEmail={state.clientEmail}
        projectName={state.projectName}
        jobSiteAddress={state.jobSiteAddress}
        estimateDate={state.estimateDate}
        controlNumber={state.controlNumber}
        estimateNotes={state.estimateNotes}
        onChange={handleFieldChange}
      />

      {/* Add Items Panel */}
      <AddItemPanel
        estimateCart={estimateCart}
        marketPrices={marketPrices}
        materials={materials}
        loadingMaterials={loadingMaterials}
        onAddItems={handleAddItems}
      />

      {/* Line Items */}
      <LineItemsCard
        lineItems={state.lineItems}
        onUpdate={handleUpdateItem}
        onRemove={handleRemoveItem}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />

      {/* Totals */}
      <TotalsCard
        subtotalCents={totals.subtotalCents}
        taxCents={totals.taxCents}
        totalCents={totals.totalCents}
        taxRatePercent={state.taxRatePercent}
        taxCounty={state.taxCounty}
        onTaxChange={handleTaxChange}
      />

      {/* Terms & Customization */}
      <article className="rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm sm:px-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
          Terms & Customization
        </p>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Terms & Conditions{" "}
            <span className="font-normal normal-case text-slate-400">
              (shown on estimate PDF)
            </span>
          </label>
          <textarea
            value={state.terms}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "terms",
                value: e.target.value,
              })
            }
            placeholder="e.g. This estimate is valid for 30 days. Payment due upon completion. Materials subject to availability."
            rows={2}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-orange-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-orange-brand]/20"
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Your business name, phone, and logo from your{" "}
          <Link
            href="/command-center"
            className="text-orange-brand hover:underline"
          >
            Business Profile
          </Link>{" "}
          will appear on the PDF automatically.
        </p>
      </article>

      {/* Action Bar */}
      <ActionBar
        onSaveDraft={handleSaveDraft}
        onGeneratePdf={handleGeneratePdf}
        onSendToClient={handleSendToClient}
        saving={saving}
        generatingPdf={generatingPdf}
        sending={sending}
        hasLineItems={hasLineItems}
        hasClientEmail={hasClientEmail}
      />

      {/* Contractor Signature Modal */}
      {showSignModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-300 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-brand">
                  Contractor Signature
                </p>
                <p className="mt-0.5 text-sm text-slate-700">
                  Sign before sending to the client.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <EstimateSignaturePad
              ref={sigPadRef}
              label="Your signature"
              height="h-40"
            />

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSignAndSend}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-brand text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-[--color-orange-dark]"
              >
                <Send className="h-4 w-4" />
                Sign & Send to Client
              </button>
              <button
                type="button"
                onClick={handleSkipSignature}
                className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-600 transition hover:border-[--color-orange-rim] hover:text-[--color-orange-dark]"
              >
                Skip Signature & Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
