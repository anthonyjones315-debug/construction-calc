export const COOKIE_CONSENT_CHANGED_EVENT = "bcp:cookie-consent-changed";

export type CookieConsentChoice = "accepted" | "rejected";
export type TermlyConsentCategory =
  | "essential"
  | "performance"
  | "analytics"
  | "advertising"
  | "social_networking"
  | "unclassified";
export type TermlyConsentState = Partial<Record<TermlyConsentCategory, boolean>>;

declare global {
  interface Window {
    Termly?: {
      getConsentState?: () => TermlyConsentState | null | undefined;
      on?: (
        event: "initialized" | "consent",
        callback: (data?: unknown) => void,
      ) => void;
      initialize?: () => void;
    };
  }
}

const OPTIONAL_CATEGORIES: TermlyConsentCategory[] = [
  "performance",
  "analytics",
  "advertising",
  "social_networking",
];

let inMemoryConsentState: TermlyConsentState | null = null;

function sanitizeConsentState(
  value: TermlyConsentState | null | undefined,
): TermlyConsentState | null {
  if (!value || typeof value !== "object") return null;

  const categories: TermlyConsentCategory[] = [
    "essential",
    "performance",
    "analytics",
    "advertising",
    "social_networking",
    "unclassified",
  ];

  const nextState: TermlyConsentState = {};

  for (const category of categories) {
    if (typeof value[category] === "boolean") {
      nextState[category] = value[category];
    }
  }

  return Object.keys(nextState).length > 0 ? nextState : null;
}

export function readConsentState(): TermlyConsentState | null {
  if (typeof window === "undefined") return inMemoryConsentState;

  const termlyState = sanitizeConsentState(
    window.Termly?.getConsentState?.(),
  );
  if (termlyState) {
    inMemoryConsentState = termlyState;
    return termlyState;
  }

  return inMemoryConsentState;
}

export function hasConsentFor(category: TermlyConsentCategory): boolean {
  const state = readConsentState();
  return state?.[category] === true;
}

export function readCookieConsent(): CookieConsentChoice | null {
  const state = readConsentState();
  if (!state) return null;
  return OPTIONAL_CATEGORIES.some((category) => state[category] === true)
    ? "accepted"
    : "rejected";
}

export function notifyConsentChanged(state?: TermlyConsentState | null) {
  if (typeof window === "undefined") return;
  const nextState = sanitizeConsentState(state ?? readConsentState());
  if (nextState) {
    inMemoryConsentState = nextState;
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, {
      detail: readCookieConsent(),
    }),
  );
}
