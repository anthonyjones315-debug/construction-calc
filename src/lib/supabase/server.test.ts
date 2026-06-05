import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createServerClient } from "./server";
import { createClient } from "@supabase/supabase-js";

// Mock the Supabase client creation
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

describe("createServerClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clone original environment variables to safely manipulate them
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it("should create a client when both environment variables are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

    const mockClient = { dummy: true };
    // @ts-expect-error - Mocking the return value for testing
    vi.mocked(createClient).mockReturnValue(mockClient);

    const client = createServerClient();

    expect(client).toBe(mockClient);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "test-service-role-key",
      { auth: { persistSession: false } }
    );
  });

  it("should throw an error when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

    expect(() => createServerClient()).toThrow("Missing NEXT_PUBLIC_SUPABASE_URL");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("should throw an error when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createServerClient()).toThrow("Missing SUPABASE_SERVICE_ROLE_KEY");
    expect(createClient).not.toHaveBeenCalled();
  });
});
