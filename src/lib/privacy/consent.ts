export const COOKIE_CONSENT_STORAGE_KEY = "bcp-cookie-consent-v1";
export const COOKIE_CONSENT_SESSION_STORAGE_KEY =
  "bcp-cookie-consent-session-v1";
export const COOKIE_CONSENT_COOKIE_NAME = "bcp_cookie_consent";
export const COOKIE_PREFERENCES_OPEN_EVENT = "bcp:open-cookie-preferences";
export const COOKIE_CONSENT_CHANGED_EVENT = "bcp:cookie-consent-changed";

export type CookieConsentChoice = "accepted" | "rejected";

let inMemoryCookieConsent: CookieConsentChoice | null = null;

function canUseStorage(storage: Storage): boolean {
  try {
    const key = "bcp-cookie-consent-storage-check";
    storage.setItem(key, "1");
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function parseCookieValue(cookieName: string): string | null {
  if (typeof document === "undefined") return null;

  try {
    const encodedName = `${cookieName}=`;
    const match = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(encodedName));

    return match ? decodeURIComponent(match.slice(encodedName.length)) : null;
  } catch {
    return null;
  }
}

function readLocalStorageConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;

  if (!canUseStorage(window.localStorage)) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

function readSessionStorageConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;

  if (!canUseStorage(window.sessionStorage)) {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(
      COOKIE_CONSENT_SESSION_STORAGE_KEY,
    );
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentChoice | null {
  const hasLocalStorage =
    typeof window !== "undefined" && canUseStorage(window.localStorage);

  const stored = readLocalStorageConsent();
  if (stored) {
    inMemoryCookieConsent = stored;
    return stored;
  }

  if (!hasLocalStorage) {
    const sessionStored = readSessionStorageConsent();
    if (sessionStored) {
      inMemoryCookieConsent = sessionStored;
      return sessionStored;
    }
  }

  const cookieValue = parseCookieValue(COOKIE_CONSENT_COOKIE_NAME);
  if (cookieValue === "accepted" || cookieValue === "rejected") {
    inMemoryCookieConsent = cookieValue;
    return cookieValue;
  }

  return inMemoryCookieConsent;
}

export function writeCookieConsent(choice: CookieConsentChoice) {
  if (typeof window === "undefined") return;

  inMemoryCookieConsent = choice;

  const hasLocalStorage = canUseStorage(window.localStorage);

  try {
    if (hasLocalStorage) {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
    }
  } catch {
    // Storage can be blocked by privacy settings. Keep the in-memory choice.
  }

  if (!hasLocalStorage) {
    try {
      window.sessionStorage.setItem(COOKIE_CONSENT_SESSION_STORAGE_KEY, choice);
    } catch {
      // Session storage may also be blocked.
    }
  }

  if (typeof document !== "undefined") {
    try {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(choice)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    } catch {
      // Some browsers block cookie writes until consent is granted.
    }
  }

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: choice }),
  );
}
