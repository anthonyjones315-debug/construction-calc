/**
 * Module-level ref for Calculator Audit: holds the latest calculator inputs and trade
 * so Sentry ErrorBoundary can attach them when a calculation error occurs.
 * Used for reproduction in Sentry/Marcy.
 */
export type CalculatorAuditSnapshot = {
  inputs: Record<string, unknown>;
  trade: string;
  canonicalPath: string;
};

const ref: { current: CalculatorAuditSnapshot | null } = { current: null };

export function getCalculatorAuditRef(): typeof ref {
  return ref;
}

export function setCalculatorAuditSnapshot(snapshot: CalculatorAuditSnapshot): void {
  ref.current = snapshot;
}
