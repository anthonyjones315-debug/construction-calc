export default function CalcLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[--color-orange-brand] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[--color-ink-dim]">Loading calculator…</p>
      </div>
    </div>
  )
}
