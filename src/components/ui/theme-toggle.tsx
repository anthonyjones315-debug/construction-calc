"use client";

import * as React from "react";
import { Monitor, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

const THEME_SEQUENCE = ["system", "light", "dark"] as const;

type ThemeMode = (typeof THEME_SEQUENCE)[number];

function getNextTheme(theme: string | undefined): ThemeMode {
  const currentIndex = THEME_SEQUENCE.indexOf((theme as ThemeMode) ?? "system");
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  return THEME_SEQUENCE[(safeIndex + 1) % THEME_SEQUENCE.length];
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? ((theme as ThemeMode | undefined) ?? "system") : "system";
  const effectiveTheme = mounted ? resolvedTheme : undefined;
  const nextTheme = getNextTheme(activeTheme);

  const icon =
    activeTheme === "light" ? (
      <SunMedium className="h-4.5 w-4.5" aria-hidden />
    ) : activeTheme === "dark" ? (
      <Moon className="h-4.5 w-4.5" aria-hidden />
    ) : (
      <Monitor className="h-4.5 w-4.5" aria-hidden />
    );

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={[
        "glass-gpu relative inline-flex h-11 w-11 items-center justify-center rounded-full border",
        "border-white/15 bg-white/10 text-copy-primary shadow-[var(--shadow-glass-sm)]",
        "backdrop-blur-xl backdrop-saturate-150 transition-[transform,box-shadow,border-color,background-color,color] duration-200",
        "hover:border-primary/55 hover:bg-white/14 active:scale-[0.97]",
        activeTheme === "system"
          ? "ring-1 ring-primary/25"
          : "ring-1 ring-primary/45 shadow-[var(--shadow-glass-md),0_0_18px_rgb(var(--color-primary-rgb)/0.22)]",
      ].join(" ")}
      aria-label={`Theme: ${activeTheme}. Tap to switch to ${nextTheme}.`}
      title={`Theme: ${activeTheme}${effectiveTheme ? ` (${effectiveTheme})` : ""}`}
      data-theme-toggle={activeTheme}
    >
      <span className="sr-only">
        Visibility preference {activeTheme}. Next mode {nextTheme}.
      </span>
      {icon}
      <span
        aria-hidden
        className={[
          "absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-primary transition-all duration-200",
          activeTheme === "system" ? "opacity-45" : "opacity-90 shadow-[0_0_10px_rgb(var(--color-primary-rgb)/0.55)]",
        ].join(" ")}
      />
    </button>
  );
}
