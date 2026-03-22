export default function CommandCenterLoading() {
  return (
    <div className="command-theme page-shell command-center-page-shell flex min-h-dvh flex-col overflow-hidden bg-[--color-bg]">
      {/* Header skeleton */}
      <div
        className="sticky top-0 z-50 h-14 border-b border-[--color-border] bg-[--color-surface]"
        aria-hidden="true"
      >
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
        className="viewport-main"
        aria-busy="true"
        aria-label="Loading Command Center…"
      >
        <div className="viewport-frame command-center-page-frame">
          <div className="h-full w-full overflow-hidden rounded-none border border-[--color-border] bg-[--color-surface] xl:rounded-[30px]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-center justify-between border-b border-[--color-border] px-4 py-3 sm:px-5">
                <div className="space-y-2">
                  <div className="skeleton h-3.5 w-28 rounded" />
                  <div className="skeleton h-4 w-72 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="skeleton h-9 w-20 rounded-full" />
                  <div className="skeleton h-9 w-9 rounded-full" />
                  <div className="skeleton h-9 w-9 rounded-full" />
                </div>
              </div>

              <div className="border-b border-[--color-border] px-4 py-3 sm:px-5">
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-11 w-32 rounded-2xl" />
                  ))}
                </div>
              </div>

              <div className="grid min-h-0 flex-1 gap-4 px-4 py-4 sm:px-5 sm:py-5 xl:grid-cols-[1.2fr,0.88fr]">
                <div className="grid gap-4">
                  <div className="skeleton h-72 w-full rounded-[28px]" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-40 w-full rounded-2xl" />
                  ))}
                  <div className="skeleton sm:col-span-2 h-44 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
