"use client";

export function CookiePreferencesButton() {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="Manage cookie preferences"
        className="termly-display-preferences text-[--color-ink-mid] hover:text-[--color-blue-brand] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-blue-brand] focus-visible:ring-offset-2 rounded transition-colors"
      >
        Cookie Preferences
      </button>
    </div>
  );
}
