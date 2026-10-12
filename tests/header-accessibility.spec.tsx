import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  UserButton: Object.assign(
    () => null,
    {
      MenuItems: () => null,
      Link: () => null,
    },
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

vi.mock("@/hooks/useOnlineStatus", () => ({
  useOnlineStatus: () => true,
}));

vi.mock("@/hooks/useClickOutside", () => ({
  useClickOutside: () => {},
}));

vi.mock("@/lib/store", () => ({
  useStore: (selector: (s: { estimateCart: unknown[] }) => unknown) =>
    selector({ estimateCart: [] }),
}));

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

    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[--color-blue-brand]");
    expect(html).toContain('aria-label="Pro Construction Calc"');
    expect(html).toContain('aria-label="Toggle navigation menu"');
    expect(html).toContain('aria-label="Estimate queue 0 items"');
  });
});
