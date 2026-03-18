"use client";

type CalculatorAuditRow = {
  label: string;
  value: string;
};

type CalculatorAuditPanelProps = {
  title: string;
  rows: CalculatorAuditRow[];
  className?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function CalculatorAuditPanel({
  title,
  rows,
  className,
}: CalculatorAuditPanelProps) {
  return (
    <section className={cx("glass-panel p-3 transition-colors", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-display-heading">
          {title}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          Live
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="glass-panel-deep rounded-lg px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-copy-secondary">
                {row.label}
              </span>
              <span className="text-sm font-semibold text-copy-primary">
                {row.value}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
