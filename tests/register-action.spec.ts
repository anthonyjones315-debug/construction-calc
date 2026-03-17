import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  ensurePublicUserRecord: vi.fn(),
  captureException: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  shutdown: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/email/welcome", () => ({
  sendWelcomeEmail: mocks.sendWelcomeEmail,
}));

vi.mock("@/lib/supabase/ensurePublicUser", () => ({
  ensurePublicUserRecord: mocks.ensurePublicUserRecord,
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: () => ({
    capture: mocks.capture,
    identify: mocks.identify,
    shutdown: mocks.shutdown,
  }),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: mocks.captureException,
}));

import { registerUserAction } from "@/app/register/actions";

function buildFormData() {
  const formData = new FormData();
  formData.set("fullName", "Sam Builder");
  formData.set("email", "sam@example.com");
  formData.set("password", "SuperSecret123!");
  return formData;
}

function createMockDb() {
  const createUser = vi.fn().mockResolvedValue({
    data: { user: { id: "auth-user-1" } },
    error: null,
  });
  const businessesInsert = vi.fn();
  const membershipsUpsert = vi.fn();
  const businessProfilesUpsert = vi.fn();

  return {
    db: {
      auth: {
        admin: {
          createUser,
        },
      },
      from: vi.fn((table: string) => {
        if (table === "businesses") {
          return {
            insert: businessesInsert,
          };
        }

        if (table === "memberships") {
          return {
            upsert: membershipsUpsert,
          };
        }

        if (table === "business_profiles") {
          return {
            upsert: businessProfilesUpsert,
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }),
    },
    createUser,
    businessesInsert,
    membershipsUpsert,
    businessProfilesUpsert,
  };
}

describe("registerUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendWelcomeEmail.mockResolvedValue(undefined);
    mocks.shutdown.mockResolvedValue(undefined);
  });

  it("skips business seeding when public user sync fails", async () => {
    const { db, businessesInsert, membershipsUpsert, businessProfilesUpsert } =
      createMockDb();
    mocks.createServerClient.mockReturnValue(db);
    mocks.ensurePublicUserRecord.mockRejectedValue(
      new Error("duplicate key value violates unique constraint \"users_email_key\""),
    );

    const result = await registerUserAction(
      { status: "idle" },
      buildFormData(),
    );

    expect(result.status).toBe("success");
    expect(mocks.ensurePublicUserRecord).toHaveBeenCalledWith(db, {
      id: "auth-user-1",
      name: "Sam Builder",
      email: "sam@example.com",
      image: null,
    });
    expect(businessesInsert).not.toHaveBeenCalled();
    expect(membershipsUpsert).not.toHaveBeenCalled();
    expect(businessProfilesUpsert).not.toHaveBeenCalled();
    expect(mocks.captureException).toHaveBeenCalledTimes(1);
    expect(mocks.capture).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "auth-user-1",
        event: "user_registered",
      }),
    );
  });
});
