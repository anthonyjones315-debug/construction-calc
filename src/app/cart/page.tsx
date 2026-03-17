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

  function handleCheckout() {
    if (!hasItems) return;
    clearCart();
    router.push("/saved");
  }

  return (
    <div className="command-theme page-shell flex min-h-dvh flex-col bg-[--color-bg] text-white">
      <Header />
      <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <p className="section-kicker">Estimate cart</p>
            <h1 className="mt-1 text-3xl font-display font-bold">
              Checkout
            </h1>
            <p className="mt-2 text-sm text-[--color-nav-text]/80">
              Review the estimates you&apos;ve added from different calculators, then
              check out in one batch. Saved estimates appear on the Saved page.
            </p>
          </div>

          {!hasItems ? (
            <div className="content-card p-6 text-sm text-[--color-nav-text]/85">
              Your cart is empty. Run a calculator and use <strong>Finalize &amp; Send → Add
              to cart</strong> to start building a multi-calculator order.
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
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[--color-orange-brand]/90">
                        {item.calculatorLabel}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
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
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[--color-nav-text]/90">
                        Qty {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        className="text-xs font-semibold text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[--color-nav-text]/80">
                  {estimateCart.length} item{estimateCart.length > 1 ? "s" : ""} in cart.
                  Checkout will save them together so you can export PDFs or send for
                  signature later.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    Clear cart
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="rounded-xl bg-[--color-orange-brand] px-4 py-2 text-sm font-bold text-white hover:brightness-95"
                  >
                    Checkout
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
