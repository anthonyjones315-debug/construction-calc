/**
 * On-site activity store for personalized "recommended starting points."
 * Only reads/writes when the user has accepted optional cookies (consent).
 *
 * We cannot access browser search history (e.g. Google); recommendations
 * are based solely on previous visits and interactions within this site.
 */

import { readCookieConsent } from "@/lib/privacy/consent";

const ACTIVITY_STORAGE_KEY = "pcc-activity-v1";
const MAX_VISIT_ENTRIES = 64;
const MAX_RECENT = 8;

export type VisitEntry = {
  path: string;
  count: number;
  lastAt: number;
};

export type ActivityStore = {
  visits: Record<string, VisitEntry>;
};

function canUseStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem("pcc-activity-check", "1");
    window.localStorage.removeItem("pcc-activity-check");
    return true;
  } catch {
    return false;
  }
}

function readStore(): ActivityStore {
  if (typeof window === "undefined") return { visits: {} };
  if (!canUseStorage()) return { visits: {} };
  try {
    const raw = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return { visits: {} };
    const parsed = JSON.parse(raw) as Partial<ActivityStore>;
    const visits = parsed?.visits && typeof parsed.visits === "object" ? parsed.visits : {};
    return { visits };
  } catch {
    return { visits: {} };
  }
}

function writeStore(store: ActivityStore): void {
  if (typeof window === "undefined") return;
  if (!canUseStorage()) return;
  try {
    const trimmed = trimVisitEntries(store, MAX_VISIT_ENTRIES);
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or disabled
  }
}

function trimVisitEntries(store: ActivityStore, max: number): ActivityStore {
  const entries = Object.entries(store.visits);
  if (entries.length <= max) return store;
  const sorted = entries.sort((a, b) => b[1].lastAt - a[1].lastAt);
  const kept = sorted.slice(0, max);
  return { visits: Object.fromEntries(kept) };
}

/**
 * Record a calculator or page visit. Only persists when optional cookies are accepted.
 * Call when the user lands on a calculator page or opens a tool from the directory.
 */
export function recordVisit(path: string): void {
  if (typeof path !== "string" || !path.startsWith("/")) return;
  if (readCookieConsent() !== "accepted") return;

  const store = readStore();
  const normalized = path.replace(/\/$/, "") || "/";
  const existing = store.visits[normalized];

  store.visits[normalized] = {
    path: normalized,
    count: (existing?.count ?? 0) + 1,
    lastAt: Date.now(),
  };

  writeStore(store);
}

/**
 * Return recently visited paths (most recent first), up to limit.
 * Only returns data when optional cookies are accepted.
 */
export function getRecentPaths(limit = MAX_RECENT): string[] {
  if (readCookieConsent() !== "accepted") return [];
  const store = readStore();
  const entries = Object.values(store.visits)
    .filter((e) => e.path && e.path.startsWith("/calculators/"))
    .sort((a, b) => b.lastAt - a.lastAt);
  return entries.slice(0, limit).map((e) => e.path);
}

/**
 * Return paths ordered by visit count (most used first), up to limit.
 */
export function getFrequentPaths(limit = MAX_RECENT): string[] {
  if (readCookieConsent() !== "accepted") return [];
  const store = readStore();
  const entries = Object.values(store.visits)
    .filter((e) => e.path && e.path.startsWith("/calculators/"))
    .sort((a, b) => b.count - a.count);
  return entries.slice(0, limit).map((e) => e.path);
}

/**
 * Check whether we are allowed to use personalization (consent + any data).
 */
export function hasPersonalization(): boolean {
  return readCookieConsent() === "accepted" && getRecentPaths(1).length > 0;
}
