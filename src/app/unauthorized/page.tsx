export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
        Access denied
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-[--color-ink]">
        You do not have access to that business record.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[--color-ink-dim]">
        The estimate or workspace you requested belongs to a different business.
        Sign in with the correct account or ask a business owner to add you as a
        member.
      </p>
    </main>
  );
}
