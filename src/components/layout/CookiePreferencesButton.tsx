"use client";

export function CookiePreferencesButton() {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="Open cookie preferences"
        className="termly-display-preferences text-[--color-ink-mid] hover:text-[--color-blue-brand] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
      >
        Cookie Preferences
      </button>
    </div>
  );
}
