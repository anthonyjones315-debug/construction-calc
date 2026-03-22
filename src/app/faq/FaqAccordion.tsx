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
    <div className="columns-1 gap-3 md:columns-2">
      {items.map((item, index) => {
        const isOpen = openItems[index] === true;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <article
            key={item.q}
            className="content-card mb-3 break-inside-avoid overflow-hidden"
          >
            <div className="grid grid-cols-[1fr_auto] items-start gap-3 px-4 py-3">
              <h2 className="text-sm font-semibold leading-snug text-[--color-ink]">
                {item.q}
              </h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(index)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-lg font-semibold leading-none text-[--color-ink-dim] transition-colors hover:border-[--color-orange-brand] hover:text-[--color-orange-brand]"
              >
                {isOpen ? "−" : "+"}
              </button>
            </div>

            {isOpen ? (
              <div
                id={panelId}
                className="trim-border-strong border-t px-4 pb-4 pt-3 text-[13px] leading-relaxed text-[--color-ink-mid]"
              >
                {item.a}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
