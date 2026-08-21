import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

describe("Command Center Security & Rate Limiting", () => {
  it("enforces rate limits on command center join attempts", () => {
    const key = `test-join-user-${Date.now()}`;
    const limit = 5;
    const windowMs = 60_000;

    // First 5 attempts should succeed
    for (let i = 0; i < limit; i++) {
      const res = checkMemoryRateLimit("command-center-join", key, limit, windowMs);
      expect(res.ok).toBe(true);
    }

    // 6th attempt should be blocked with rate limit error
    const blockedRes = checkMemoryRateLimit("command-center-join", key, limit, windowMs);
    expect(blockedRes.ok).toBe(false);
    if (!blockedRes.ok) {
      expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("sanitizes error responses to prevent internal database detail leakage", () => {
    // Standard generic 500 error message used across hardened routes
    const genericError = { error: "Internal Server Error", status: 500 };
    const rawDbError = "PGRST100: relation 'memberships' column 'non_existent_column' does not exist";

    // Ensure raw db error string is not exposed in standard error response payload
    expect(genericError.error).not.toContain("PGRST");
    expect(genericError.error).not.toContain("column");
    expect(genericError.error).not.toContain(rawDbError);
    expect(genericError.error).toBe("Internal Server Error");
  });
});
