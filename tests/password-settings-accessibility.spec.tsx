import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: "user_123", isLoaded: true }),
  useUser: () => ({ user: null }),
  useClerk: () => ({ signOut: vi.fn(), openUserProfile: vi.fn() }),
}));

import { PasswordSettings } from "@/components/settings/PasswordSettings";

describe("PasswordSettings accessibility and focus states", () => {
  it("renders buttons with proper focus-visible ring classes and aria-hidden on decorative icons", () => {
    const html = renderToStaticMarkup(<PasswordSettings />);

    // Check "Open account security" button focus-visible styling
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
    expect(html).toContain("Open account security");

    // Check "Delete Account" button focus-visible styling & aria attributes
    expect(html).toContain("focus-visible:ring-red-500");
    expect(html).toContain("Delete Account");
    expect(html).toContain('aria-hidden="true"');

    // Check live region for polite screen reader status announcements
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
  });
});
