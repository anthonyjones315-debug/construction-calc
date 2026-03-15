const DEFAULT_REVALIDATION_TIMEOUT_MS = 3500;

export class SupabaseTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseTimeoutError";
  }
}

function getTimeoutMs(): number {
  const fromEnv = Number(process.env.SUPABASE_REVALIDATION_TIMEOUT_MS ?? "");
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return fromEnv;
  }
  return DEFAULT_REVALIDATION_TIMEOUT_MS;
}

export async function withSupabaseRevalidationTimeout<T>(
  operation: PromiseLike<T>,
  operationName: string,
): Promise<T> {
  const timeoutMs = getTimeoutMs();
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const operationPromise = Promise.resolve(operation);

  try {
    return await Promise.race([
      operationPromise,
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(
            new SupabaseTimeoutError(
              `${operationName} timed out after ${timeoutMs}ms`,
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export function isSupabaseTimeoutLike(error: unknown): boolean {
  if (error instanceof SupabaseTimeoutError) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    message?: string;
    code?: string;
    name?: string;
  };

  const message = maybeError.message?.toLowerCase() ?? "";
  const code = maybeError.code ?? "";
  const name = maybeError.name ?? "";

  return (
    name === "AbortError" ||
    code === "57014" ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("statement timeout") ||
    message.includes("query_canceled")
  );
}

export function throwForStaleCacheOnTimeout(
  error: unknown,
  operationName: string,
): void {
  if (!isSupabaseTimeoutLike(error)) {
    return;
  }

  const message =
    error instanceof Error ? error.message : "Supabase timeout detected";

  throw new SupabaseTimeoutError(
    `[stale-cache-fallback] ${operationName}: ${message}`,
  );
}
