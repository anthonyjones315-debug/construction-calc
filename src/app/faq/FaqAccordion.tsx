"use client";

import { useId, useState } from "react";

type FAQItem = {
  q: string;
  a: string;
};

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const baseId = useId();
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  function toggleItem(index: number) {
    setOpenItems((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openItems[index] === true;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <article
            key={item.q}
            className="rounded-2xl border border-[--color-border] bg-white transition-all duration-200 hover:border-[--color-blue-brand]/40 hover:shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleItem(index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none"
            >
              <h2 className="text-base font-bold tracking-tight text-[--color-ink]">
                {item.q}
              </h2>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-lg font-black leading-none text-[--color-ink-dim] transition-all hover:bg-[--color-blue-soft] hover:text-[--color-blue-brand] ${isOpen ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>

            {isOpen && (
              <div
                id={panelId}
                className="border-t border-[--color-border]/60 bg-[--color-surface-alt]/50 px-5 py-4 text-[14px] leading-relaxed text-[--color-ink-mid]"
              >
                {item.a}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
