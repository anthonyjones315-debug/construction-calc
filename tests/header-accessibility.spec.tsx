import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Mock @clerk/nextjs
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  UserButton: () => null,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock useClerkAuthFlow hook
vi.mock("@/components/auth/useClerkAuthFlow", () => ({
  useClerkAuthFlow: () => ({
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
  }),
}));

import { Header } from "@/components/layout/Header";

describe("Header accessibility", () => {
  it("includes focus-visible ring styles on interactive navigation elements", () => {
    const html = renderToStaticMarkup(<Header />);

    // Verify logo link focus-visible class
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
    // Verify ARIA labels for accessibility
    expect(html).toContain('aria-label="Pro Construction Calc"');
    expect(html).toContain('aria-label="Main navigation"');
    expect(html).toContain('aria-label="Toggle navigation menu"');
  });
});
