"use client";

import * as React from "react";
import { SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

// Dark mode is disabled — app is committed to warm light theme only.
// The toggle enforces light mode on mount and stays as a light-mode indicator.
export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setTheme("light");
  }, [setTheme]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setTheme("light")}
      className={[
        "glass-gpu relative inline-flex h-11 w-11 items-center justify-center rounded-full border",
        "border-white/15 bg-white/10 text-copy-primary shadow-[var(--shadow-glass-sm)]",
        "backdrop-blur-xl backdrop-saturate-150 transition-[transform,box-shadow,border-color,background-color,color] duration-200",
        "hover:border-primary/55 hover:bg-white/14 active:scale-[0.97]",
        "ring-1 ring-primary/45 shadow-[var(--shadow-glass-md),0_0_18px_rgb(var(--color-primary-rgb)/0.22)]",
      ].join(" ")}
      aria-label="Light mode active"
      title="Light mode"
      data-theme-toggle="light"
    >
      <span className="sr-only">Light mode active</span>
      <SunMedium className="h-4.5 w-4.5" aria-hidden />
      <span
        aria-hidden
        className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-primary opacity-90 shadow-[0_0_10px_rgb(var(--color-primary-rgb)/0.55)] transition-all duration-200"
      />
    </button>
  );
}
