import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

describe("POST /api/clients/sync security", () => {
  it("returns generic 'Internal Server Error' on unhandled internal database errors", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(createServerClient).mockReturnValueOnce({
      from: () => {
        throw new Error("Sensitive DB connection error with password: my_secret_db_password");
      },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/clients/sync", {
      method: "POST",
      body: JSON.stringify({ name: "John Doe" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Internal Server Error");
    expect(JSON.stringify(data)).not.toContain("my_secret_db_password");
  });
});
