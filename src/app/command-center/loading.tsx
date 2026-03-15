export default function CommandCenterLoading() {
  return (
    <div className="command-theme flex min-h-screen flex-col bg-[#0F0F10]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 h-14 border-b border-slate-800 bg-slate-950" aria-hidden="true">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
          <div className="skeleton h-5 w-44 rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="skeleton h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <main
        id="main-content"
        className="mx-auto w-full max-w-screen-xl flex-1 bg-[#0F0F10] px-4 py-6"
        aria-busy="true"
        aria-label="Loading Command Center…"
      >
        <div className="w-full overflow-hidden rounded-none border border-slate-800 bg-slate-950 sm:rounded-[30px]">
          <div className="grid min-h-[720px] lg:grid-cols-[240px,1fr]">

            {/* Sidebar skeleton */}
            <aside className="hidden border-r border-slate-800 bg-slate-950 px-2 py-2 lg:flex lg:flex-col" aria-hidden="true">
              <div className="flex items-center gap-1.5 px-1.5 py-1">
                <div className="skeleton h-6 w-6 rounded-md" />
                <div className="skeleton h-4 w-32 rounded" />
              </div>
              <div className="mt-2 space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton mx-1 h-8 rounded-lg" />
                ))}
              </div>
              <div className="mt-3 px-2">
                <div className="skeleton h-2 w-10 rounded" />
              </div>
              <div className="mt-2 space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton mx-1 h-7 rounded-lg" />
                ))}
              </div>
            </aside>

            {/* Main panel skeleton */}
            <section className="bg-slate-950">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="flex items-center gap-3">
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="skeleton h-9 w-9 rounded-full" />
                </div>
              </div>

              <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-6">
                {/* Status banner */}
                <div className="skeleton h-10 w-full rounded-2xl" />

                {/* Page title */}
                <div className="skeleton h-9 w-64 rounded-lg" />

                {/* Two-column cards */}
                <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
                  <div className="skeleton h-28 w-full rounded-2xl" />
                  <div className="skeleton h-28 w-full rounded-2xl" />
                </div>

                {/* Team table skeleton */}
                <div className="rounded-2xl border border-slate-700 bg-slate-900">
                  <div className="border-b border-slate-800 px-5 py-4">
                    <div className="skeleton h-5 w-44 rounded" />
                  </div>
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <div className="skeleton h-3 w-32 rounded" />
                          <div className="skeleton h-2.5 w-24 rounded" />
                        </div>
                        <div className="skeleton h-6 w-16 rounded-full" />
                        <div className="skeleton h-3 w-20 rounded" />
                        <div className="skeleton h-7 w-7 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
