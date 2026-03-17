import "server-only";

const VERIFY_WINDOW_MS = 5 * 60 * 1000;
const VERIFY_MAX_ATTEMPTS = 5;
const RESEND_WINDOW_MS = 60 * 1000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const verifyAttemptStore = new Map<string, RateLimitEntry>();
const resendStore = new Map<string, RateLimitEntry>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function pruneExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getTwoFactorRateLimitKey(email: string, ipAddress?: string | null) {
  return `${normalizeEmail(email)}:${ipAddress?.trim() || "unknown"}`;
}

export function getTwoFactorVerifyLockoutSeconds(key: string) {
  const now = Date.now();
  pruneExpiredEntries(verifyAttemptStore, now);
  const entry = verifyAttemptStore.get(key);

  if (!entry || entry.count < VERIFY_MAX_ATTEMPTS) {
    return 0;
  }

  return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
}

export function recordTwoFactorVerifyFailure(key: string) {
  const now = Date.now();
  pruneExpiredEntries(verifyAttemptStore, now);

  const current = verifyAttemptStore.get(key);
  if (!current || current.resetAt <= now) {
    verifyAttemptStore.set(key, {
      count: 1,
      resetAt: now + VERIFY_WINDOW_MS,
    });
    return;
  }

  verifyAttemptStore.set(key, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });
}

export function clearTwoFactorVerifyFailures(key: string) {
  verifyAttemptStore.delete(key);
}

export function getTwoFactorResendCooldownSeconds(key: string) {
  const now = Date.now();
  pruneExpiredEntries(resendStore, now);
  const entry = resendStore.get(key);

  if (!entry) {
    return 0;
  }

  return Math.max(0, Math.ceil((entry.resetAt - now) / 1000));
}

export function markTwoFactorResend(key: string) {
  resendStore.set(key, {
    count: 1,
    resetAt: Date.now() + RESEND_WINDOW_MS,
  });
}
