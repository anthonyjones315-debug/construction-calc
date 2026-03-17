'use client';

import { COOKIE_PREFERENCES_OPEN_EVENT } from "@/lib/privacy/consent";

export function CookiePreferencesButton() {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new Event(COOKIE_PREFERENCES_OPEN_EVENT))
        }
        className="hover:text-white transition-colors"
      >
        Cookie Preferences
      </button>
      <a
        href="#"
        className="termly-display-preferences text-[--color-ink-mid] hover:text-white transition-colors"
      >
        Consent Preferences
      </a>
    </div>
  );
}
