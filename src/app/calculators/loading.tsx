export default function CalcLoading() {
  return (
    <div className="command-theme page-shell flex min-h-screen flex-col bg-[--color-bg]">
      {/* Nav skeleton */}
      <div
        className="sticky top-0 z-50 h-14 border-b border-[--color-border] bg-[--color-surface]"
        aria-hidden="true"
      >
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
          <div className="skeleton h-5 w-44 rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="skeleton hidden h-4 w-20 rounded md:block" />
            <div className="skeleton hidden h-4 w-20 rounded md:block" />
            <div className="skeleton h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <main
        className="min-w-0 flex-1"
        aria-busy="true"
        aria-label="Loading calculators…"
      >
        {/* Hero skeleton */}
        <div className="dark-feature-panel overflow-hidden">
          <div className="relative w-full bg-[--color-surface-alt] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <div className="mx-auto w-full max-w-5xl space-y-3">
              <div className="skeleton h-3 w-28 rounded-full" />
              <div className="skeleton h-8 w-48 rounded-lg" />
              <div className="skeleton h-4 w-72 rounded" />
              <div className="skeleton h-6 w-32 rounded-full" />
            </div>
          </div>
        </div>

        {/* Card grid skeleton — mirrors the 6-card directory */}
        <div className="mx-auto w-full max-w-5xl px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-[--color-border] bg-[--color-surface] p-5 shadow-[0_12px_36px_rgba(15,18,27,0.06)]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="skeleton h-5 w-5 rounded" />
                  <div className="skeleton h-5 w-36 rounded" />
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                </div>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="skeleton h-3 w-3/4 rounded" />
                  ))}
                </div>
                <div className="mt-4 skeleton h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
