"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { UserMaterial } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/client";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  BookOpen,
  LogIn,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { routes } from "@routes";

const CATEGORIES = [
  "Concrete",
  "Lumber",
  "Roofing",
  "Insulation",
  "Flooring",
  "Siding",
  "Paint",
  "Other",
];
const UNIT_TYPES = [
  "bag",
  "board ft",
  "sq ft",
  "lin ft",
  "cu yd",
  "gallon",
  "roll",
  "bundle",
  "each",
  "lb",
  "ton",
];

const emptyRow = {
  material_name: "",
  category: "Concrete",
  unit_type: "bag",
  unit_cost: 0,
};

function PriceBookContent() {
  const { data: session, status } = useSession();
  const [materials, setMaterials] = useState<UserMaterial[] | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState({ ...emptyRow });
  const [newRow, setNewRow] = useState({ ...emptyRow });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    let active = true;
    fetch("/api/materials")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!active) return;
        setMaterials((data as UserMaterial[]) ?? []);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id, status]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newRow.material_name.trim() || saving) return;
    setError("");
    setSavingMessage("");

    const optimisticId = `pending-${crypto.randomUUID()}`;
    const optimisticMaterial: UserMaterial = {
      id: optimisticId,
      user_id: session?.user?.id ?? "",
      business_id: "pending-business",
      material_name: newRow.material_name.trim(),
      category: newRow.category,
      unit_type: newRow.unit_type,
      unit_cost: Number(newRow.unit_cost) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMaterials((current) => [optimisticMaterial, ...(current ?? [])]);
    setNewRow({ ...emptyRow });
    setAdding(false);
    setSavingMessage("Saving material…");
    setSaving(true);

    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newRow,
        material_name: newRow.material_name.trim(),
        unit_cost: Number(newRow.unit_cost),
      }),
    });
    const { data, error: err } = await res.json();

    if (res.ok && data) {
      setMaterials((current) =>
        (current ?? []).map((row) =>
          row.id === optimisticId ? (data as UserMaterial) : row,
        ),
      );
      setSavingMessage("Saved to price book.");
      setTimeout(() => setSavingMessage(""), 2200);
    } else {
      setMaterials((current) =>
        (current ?? []).filter((row) => row.id !== optimisticId),
      );
      setError(err ?? "Add failed");
      setAdding(true);
      setSavingMessage("");
    }

    setSaving(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    const res = await fetch(`/api/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editRow,
        unit_cost: Number(editRow.unit_cost),
      }),
    });
    const { error: err } = await res.json();
    if (res.ok) {
      setMaterials((m) =>
        (m ?? []).map((r) =>
          r.id === id
            ? { ...r, ...editRow, unit_cost: Number(editRow.unit_cost) }
            : r,
        ),
      );
      setEditId(null);
    } else setError(err ?? "Update failed");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    setMaterials((m) => (m ?? []).filter((r) => r.id !== id));
  }

  if (
    status === "loading" ||
    (status === "authenticated" && session?.user?.id && materials === null)
  ) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[--color-orange-brand] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <LogIn className="w-10 h-10 text-[--color-orange-brand] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[--color-ink] mb-2">
          Sign in to manage your Price Book
        </h1>
        <Link
          href={routes.auth.signIn}
          className="inline-flex items-center gap-2 bg-[--color-orange-brand] text-white font-bold px-6 py-3 rounded-xl"
        >
          Sign In Free
        </Link>
      </div>
    );
  }

  const materialRows = materials ?? [];

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      const rows = materialRows.filter((m) => m.category === cat);
      if (rows.length || cat === "Other") acc[cat] = rows;
      return acc;
    },
    {} as Record<string, UserMaterial[]>,
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-[--color-ink] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[--color-orange-brand]" /> Price
            Book
          </h1>
          <p className="text-sm text-[--color-ink-dim] mt-1">
            Your custom material costs — auto-fill into any calculator
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-[--color-orange-brand] hover:bg-[--color-orange-dark] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      <div className="content-card mb-6 overflow-hidden">
        <Image
          src="/images/pricebook-materials.svg"
          alt="Price book illustration showing material rows and unit costs"
          width={1200}
          height={700}
          priority
          className="w-full h-40 object-cover"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {savingMessage && (
        <p className="mb-4 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-4 py-2 text-sm text-emerald-700">
          {savingMessage}
        </p>
      )}

      {/* Add new row form */}
      {adding && (
        <form
          onSubmit={handleAdd}
          className="content-card mb-6 grid grid-cols-2 gap-3 border-[--color-orange-brand]/30 p-4 sm:grid-cols-4"
        >
          <input
            autoFocus
            required
            value={newRow.material_name}
            onChange={(e) =>
              setNewRow((r) => ({ ...r, material_name: e.target.value }))
            }
            placeholder="Material name"
            className="col-span-2 sm:col-span-1 input-base"
          />
          <select
            value={newRow.category}
            onChange={(e) =>
              setNewRow((r) => ({ ...r, category: e.target.value }))
            }
            className="input-base"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={newRow.unit_type}
            onChange={(e) =>
              setNewRow((r) => ({ ...r, unit_type: e.target.value }))
            }
            className="input-base"
          >
            {UNIT_TYPES.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[--color-ink-dim]">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={newRow.unit_cost}
              onChange={(e) =>
                setNewRow((r) => ({
                  ...r,
                  unit_cost: parseFloat(e.target.value) || 0,
                }))
              }
              className="input-base flex-1"
              placeholder="0.00"
            />
          </div>
          <div className="col-span-2 sm:col-span-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg border border-[--color-border] px-3 py-1.5 text-sm text-[--color-ink-dim] transition-colors hover:border-[--color-orange-brand]/35 hover:text-[--color-ink]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[--color-orange-brand] text-white text-sm font-bold rounded-lg"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}{" "}
              Save
            </button>
          </div>
        </form>
      )}

      {materialRows.length === 0 && !adding ? (
        <div className="content-card py-16 text-center">
          <BookOpen className="w-12 h-12 text-[--color-ink-dim] mx-auto mb-3 opacity-30" />
          <p className="text-[--color-ink-dim] mb-4">
            No materials yet. Add your local pricing to auto-fill calculators.
          </p>
          <button
            onClick={() => setAdding(true)}
            className="text-[--color-orange-brand] font-medium text-sm hover:underline"
          >
            + Add your first material
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, rows]) =>
            rows.length === 0 ? null : (
              <div key={cat}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[--color-ink-dim] mb-2">
                  {cat}
                </h2>
                <div className="content-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="trim-border-strong border-b">
                        <th className="text-left px-4 py-2.5 font-semibold text-[--color-ink-dim] text-xs uppercase tracking-wide">
                          Material
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-[--color-ink-dim] text-xs uppercase tracking-wide hidden sm:table-cell">
                          Unit
                        </th>
                        <th className="text-right px-4 py-2.5 font-semibold text-[--color-ink-dim] text-xs uppercase tracking-wide">
                          Cost/Unit
                        </th>
                        <th className="w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((mat) => (
                        <tr
                          key={mat.id}
                          className="border-b border-[--color-border]/45 last:border-0"
                        >
                          {editId === mat.id ? (
                            <>
                              <td className="px-3 py-2">
                                <input
                                  value={editRow.material_name}
                                  onChange={(e) =>
                                    setEditRow((r) => ({
                                      ...r,
                                      material_name: e.target.value,
                                    }))
                                  }
                                  className="input-base w-full text-xs"
                                />
                              </td>
                              <td className="px-3 py-2 hidden sm:table-cell">
                                <select
                                  value={editRow.unit_type}
                                  onChange={(e) =>
                                    setEditRow((r) => ({
                                      ...r,
                                      unit_type: e.target.value,
                                    }))
                                  }
                                  className="input-base text-xs"
                                >
                                  {UNIT_TYPES.map((u) => (
                                    <option key={u}>{u}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min={0}
                                  step={0.01}
                                  value={editRow.unit_cost}
                                  onChange={(e) =>
                                    setEditRow((r) => ({
                                      ...r,
                                      unit_cost:
                                        parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  className="input-base w-24 text-right text-xs ml-auto"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleUpdate(mat.id)}
                                    className="rounded p-1.5 text-emerald-600 transition-colors hover:bg-emerald-500/10"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditId(null)}
                                    className="rounded p-1.5 text-[--color-ink-dim] transition-colors hover:bg-[--color-surface-alt]"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 font-medium text-[--color-ink]">
                                {mat.material_name}
                              </td>
                              <td className="px-4 py-3 text-[--color-ink-dim] hidden sm:table-cell">
                                {mat.unit_type}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-semibold text-[--color-orange-brand]">
                                ${Number(mat.unit_cost).toFixed(2)}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      if (String(mat.id).startsWith("pending-"))
                                        return;
                                      setEditId(mat.id);
                                      setEditRow({
                                        material_name: mat.material_name,
                                        category: mat.category ?? "Other",
                                        unit_type: mat.unit_type ?? "each",
                                        unit_cost: mat.unit_cost,
                                      });
                                    }}
                                    className="rounded p-1.5 text-[--color-ink-dim] transition-all hover:bg-[--color-orange-soft] hover:text-[--color-orange-brand]"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (String(mat.id).startsWith("pending-"))
                                        return;
                                      handleDelete(mat.id);
                                    }}
                                    className="rounded p-1.5 text-[--color-ink-dim] transition-all hover:bg-red-500/10 hover:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function PriceBookPage() {
  return (
    <div className="light public-page page-shell">
      <Header />
      <main id="main-content" className="flex-1">
        <PriceBookContent />
      </main>
      <Footer />
    </div>
  );
}
