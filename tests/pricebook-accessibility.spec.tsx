import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/pricebook",
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    userId: "user_test_123",
    isLoaded: true,
    isSignedIn: true,
  }),
  useUser: () => ({
    user: { id: "user_test_123" },
  }),
  useClerk: () => ({
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
    openUserProfile: vi.fn(),
  }),
  UserButton: () => null,
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt="" {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
    const { prefetch: _p, children, ...rest } = props;
    void _p;
    return <a {...rest}>{children}</a>;
  },
}));

import { PriceBookContent } from "@/app/pricebook/page";
import type { UserMaterial } from "@/lib/supabase/client";

const sampleMaterials: UserMaterial[] = [
  {
    id: "mat-1",
    user_id: "user_test_123",
    business_id: "biz_123",
    material_name: "2x4 Lumber 8ft",
    category: "Lumber",
    unit_type: "each",
    unit_cost: 6.75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe("PriceBook accessibility", () => {
  it("renders Add Material button and table action buttons with focus-visible styles and descriptive aria-labels", () => {
    const html = renderToStaticMarkup(
      <PriceBookContent initialMaterials={sampleMaterials} />,
    );

    expect(html).toContain("Price Book");
    expect(html).toContain("Add Material");
    expect(html).toContain("2x4 Lumber 8ft");
    expect(html).toContain("aria-label=\"Edit 2x4 Lumber 8ft\"");
    expect(html).toContain("aria-label=\"Delete 2x4 Lumber 8ft\"");
    expect(html).toContain("focus-visible:ring-2");
  });
});
