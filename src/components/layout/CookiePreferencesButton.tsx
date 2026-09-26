"use client";

export function CookiePreferencesButton() {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="Open cookie preferences dialog"
        className="termly-display-preferences text-[--color-ink-mid] hover:text-[--color-blue-brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors cursor-pointer"
      >
        Cookie Preferences
      </button>
    </div>
  );
}
