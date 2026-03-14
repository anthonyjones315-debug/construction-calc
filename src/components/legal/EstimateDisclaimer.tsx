import { cn } from '@/utils/cn'

interface EstimateDisclaimerProps {
  className?: string
}

export function EstimateDisclaimer({ className }: EstimateDisclaimerProps) {
  return (
    <div
      className={cn(
        'mx-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950',
        className,
      )}
      role="note"
      aria-label="Estimate disclaimer"
    >
      <p className="font-semibold uppercase tracking-wide text-[11px]">
        For estimating purposes only
      </p>
      <p className="mt-1">
        Verify measurements, local code requirements, site conditions, waste, and supplier pricing before ordering materials or starting work.
      </p>
    </div>
  )
}
