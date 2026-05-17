/**
 * Detects Next.js dynamic usage errors that occur during static generation (prerendering).
 * If auth() or headers() is called during a static build, Next.js throws a specific error
 * to signal that the route must be dynamic. We must re-throw this error so Next.js
 * can correctly bail out and avoid insecurely caching a private or unauthorized response.
 */
export function isPrerenderHeadersAccessError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { message?: string; digest?: string };
  const message = maybeError.message?.toLowerCase() ?? "";
  const digest = maybeError.digest ?? "";

  return (
    digest === "HANGING_PROMISE_REJECTION" ||
    (message.includes("during prerendering") &&
      message.includes("headers()") &&
      message.includes("rejects"))
  );
}
