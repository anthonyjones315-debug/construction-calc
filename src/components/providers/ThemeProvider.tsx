"use client";

import * as React from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

/** Light-only app: theme switching removed. Kept as a no-op wrapper for any legacy imports. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
