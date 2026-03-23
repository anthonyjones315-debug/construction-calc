"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const router = useRouter();
  const estimateCart = useStore((s) => s.estimateCart);
  const removeCartItem = useStore((s) => s.removeCartItem);
  const clearCart = useStore((s) => s.clearCart);

  const hasItems = estimateCart.length > 0;

  function handleCreateInvoiceBatch() {
    if (!hasItems) return;
    clearCart();
    router.push("/saved");
  }

  return (
    <div className="light public-page page-shell">
      <Header />
      <main
        id="main-content"
        className="flex-1"
      >
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <p className="section-kicker">Estimate workflow</p>
            <h1 className="mt-1 text-3xl font-display font-bold">
              Estimate Queue
            </h1>
            <p className="mt-2 text-sm text-[--color-nav-text]/80">
              Review estimate drafts from multiple calculators, then push them
              forward into your invoice workflow in one batch.
            </p>
          </div>

          {!hasItems ? (
            <div className="content-card p-6 text-sm text-[--color-nav-text]/85">
              Your estimate queue is empty. Run a calculator and use{" "}
              <strong>Finalize Estimate → Add to Estimate Queue</strong> to
              build your invoice-ready batch.
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {estimateCart.map((item) => (
                  <li
                    key={item.id}
                    className="content-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[--color-blue-brand]/90">
                        {item.calculatorLabel}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[--color-ink]">
                        {item.estimateName}
                      </p>
                      <p className="mt-1 text-xs text-[--color-nav-text]/80">
                        {item.primaryResult.label}:{" "}
                        <span className="font-mono">
                          {item.primaryResult.value} {item.primaryResult.unit}
                        </span>
                      </p>
                      {item.materialList.length > 0 && (
                        <p className="mt-1 text-xs text-[--color-nav-text]/75 line-clamp-2">
                          {item.materialList.join(" • ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1 sm:flex-col sm:items-end sm:pt-0">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-[--color-ink-mid]">
                        Qty {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[--color-nav-text]/80">
                  {estimateCart.length} estimate
                  {estimateCart.length > 1 ? "s" : ""} in queue. Creating an
                  invoice batch saves them together for fast client delivery.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-[--color-ink] hover:bg-slate-50"
                  >
                    Clear queue
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateInvoiceBatch}
                    className="rounded-xl bg-[--color-blue-brand] px-4 py-2 text-sm font-bold text-white hover:brightness-95"
                  >
                    Create invoice batch
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
