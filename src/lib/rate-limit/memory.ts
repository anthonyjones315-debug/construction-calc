import "server-only";

type Bucket = { count: number; resetAt: number };

const namedStores = new Map<string, Map<string, Bucket>>();

function getStore(name: string): Map<string, Bucket> {
  let store = namedStores.get(name);
  if (!store) {
    store = new Map();
    namedStores.set(name, store);
  }
  return store;
}

function pruneExpired(store: Map<string, Bucket>, now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

/**
 * Fixed-window in-memory limiter. Resets per server instance / cold start (not distributed).
 * Use for abuse friction on public and authenticated routes.
 */
export function checkMemoryRateLimit(
  storeName: string,
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const store = getStore(storeName);
  const now = Date.now();
  pruneExpired(store, now);

  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { ok: true };
}
