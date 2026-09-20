"use client";

export function CookiePreferencesButton() {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="Manage cookie preferences"
        className="termly-display-preferences rounded text-[--color-ink-mid] transition-colors hover:text-[--color-blue-brand] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-blue-brand]"
      >
        Cookie Preferences
      </button>
    </div>
  );
}
