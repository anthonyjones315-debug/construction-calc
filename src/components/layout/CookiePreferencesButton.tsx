"use client";

export function CookiePreferencesButton() {
  return (
    <div className="flex items-center">
      <a
        href="#"
        className="termly-display-preferences text-[--color-ink-mid] hover:text-[--color-blue-brand] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-blue-brand] rounded-xs"
      >
        Cookie Preferences
      </a>
    </div>
  );
}
