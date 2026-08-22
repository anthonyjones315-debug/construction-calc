import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CartPage from "@/app/cart/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/cart",
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false, userId: null }),
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  useClerk: () => ({ openSignIn: vi.fn(), openSignUp: vi.fn() }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => null,
}));

vi.mock("@/lib/store", () => ({
  useStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const mockState = {
      estimateCart: [
        {
          id: "item-1",
          calculatorId: "concrete",
          calculatorLabel: "Concrete Slab Calculator",
          estimateName: "Garage Foundation",
          inputsSummary: "10x10x4",
          primaryResult: { label: "Concrete Volume", value: "1.23", unit: "cu yd" },
          materialList: ["56 bags concrete (80lb)"],
          quantity: 1,
          addedAt: "2026-03-18T00:00:00.000Z",
        },
      ],
      removeCartItem: vi.fn(),
      clearCart: vi.fn(),
    };
    return selector(mockState);
  },
}));

describe("CartPage accessibility", () => {
  it("renders descriptive ARIA labels for action buttons when items are in queue", () => {
    const html = renderToStaticMarkup(<CartPage />);

    // Verify presence of aria-labels on action buttons
    expect(html).toContain('aria-label="Remove Garage Foundation from estimate queue"');
    expect(html).toContain('aria-label="Clear all estimates from queue"');
    expect(html).toContain('aria-label="Create invoice batch from estimate queue"');
  });
});
