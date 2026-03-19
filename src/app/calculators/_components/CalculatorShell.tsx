import type { TradePageDefinition } from "../_lib/trade-pages";
import { CalculatorBreadcrumb } from "./CalculatorBreadcrumb";
import { CalculatorPageHeader } from "./CalculatorPageHeader";

interface CalculatorShellProps {
  page: TradePageDefinition;
  inputsPanel: React.ReactNode;
  resultsPanel: React.ReactNode;
  contextPanel?: React.ReactNode;
}

export function CalculatorShell({
  page,
  inputsPanel,
  resultsPanel,
  contextPanel,
}: CalculatorShellProps) {
  return (
    <main id="main-content" className="flex-1 min-h-0 bg-[--color-bg]" tabIndex={-1}>
      <CalculatorBreadcrumb page={page} />
      <CalculatorPageHeader page={page} />

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
          <section aria-label="Calculator inputs" className="space-y-4">
            {inputsPanel}
          </section>

          <section aria-label="Calculator results" className="space-y-4">
            {resultsPanel}
            {contextPanel && (
              <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-sm">
                {contextPanel}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
