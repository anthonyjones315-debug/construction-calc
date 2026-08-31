"use client";

export function CookiePreferencesButton() {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={(e) => e.preventDefault()}
        className="termly-display-preferences text-[--color-ink-mid] hover:text-[--color-blue-brand] transition-colors bg-transparent border-0 p-0 font-inherit cursor-pointer"
        aria-label="Manage cookie preferences"
      >
        Cookie Preferences
      </button>
    </div>
  );
}
