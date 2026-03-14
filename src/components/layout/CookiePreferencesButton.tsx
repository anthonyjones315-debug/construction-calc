'use client'

import { COOKIE_PREFERENCES_OPEN_EVENT } from '@/lib/privacy/consent'

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_OPEN_EVENT))}
      className="hover:text-white transition-colors"
    >
      Cookie Preferences
    </button>
  )
}
