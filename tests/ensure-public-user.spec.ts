import { describe, expect, it } from "vitest";
import { ensurePublicUserRecord } from "@/lib/supabase/ensurePublicUser";

type MockUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified?: string | null;
  pro_mode_enabled?: boolean | null;
};

type EqResult = Promise<{ data?: unknown; error: { code?: string; message: string } | null }>;

type MockClientOptions = {
  missingPublicUsersTable?: boolean;
  disableCurrentUserEmailConflict?: boolean;
};

function createMockSupabaseClient(
  initialUsers: MockUserRow[],
  options: MockClientOptions = {},
) {
  const state = {
    users: [...initialUsers],
    emailLookups: 0,
    currentUserEmailUpdateFailed: false,
  };

  function findUserById(id: string) {
    return state.users.find((user) => user.id === id) ?? null;
  }

  function findUserByEmail(email: string) {
    return state.users.find((user) => user.email === email) ?? null;
  }

  function publicUsersTable() {
    let filterColumn: string | null = null;
    let filterValue: string | null = null;

    return {
      select() {
        return this;
      },
      eq(column: string, value: string) {
        filterColumn = column;
        filterValue = value;
        return this;
      },
      maybeSingle: async () => {
        if (options.missingPublicUsersTable) {
          return {
            data: null,
            error: {
              message: `Could not find the table 'public.users' in the schema cache`,
            },
          };
        }

        if (filterColumn === "id" && filterValue) {
          return { data: findUserById(filterValue), error: null };
        }

        if (filterColumn === "email" && filterValue) {
          state.emailLookups += 1;

          if (state.emailLookups === 1) {
            return { data: null, error: null };
          }

          return { data: findUserByEmail(filterValue), error: null };
        }

        return { data: null, error: null };
      },
      update(payload: Partial<MockUserRow>) {
        return {
          eq: async (column: string, value: string): EqResult => {
            if (column !== "id") {
              return { error: null };
            }

            if (
              !options.disableCurrentUserEmailConflict &&
              value === "current-user" &&
              payload.email === "sam@example.com" &&
              !state.currentUserEmailUpdateFailed
            ) {
              state.currentUserEmailUpdateFailed = true;
              return {
                error: {
                  code: "23505",
                  message:
                    'duplicate key value violates unique constraint "users_email_key"',
                },
              };
            }

            const row = findUserById(value);
            if (row) {
              Object.assign(row, payload);
            }

            return { error: null };
          },
        };
      },
      upsert(payload: MockUserRow | Partial<MockUserRow>) {
        if (options.missingPublicUsersTable) {
          return Promise.resolve({
            error: {
              message: `Could not find the table 'public.users' in the schema cache`,
            },
          });
        }

        const id = typeof payload.id === "string" ? payload.id : null;
        if (!id) {
          return Promise.resolve({ error: null });
        }

        const existing = findUserById(id);
        if (existing) {
          Object.assign(existing, payload);
        } else {
          state.users.push({
            id,
            name: payload.name ?? null,
            email: payload.email ?? null,
            image: payload.image ?? null,
            emailVerified: payload.emailVerified ?? null,
            pro_mode_enabled: payload.pro_mode_enabled ?? null,
          });
        }

        return Promise.resolve({ error: null });
      },
      delete() {
        return {
          eq: async (column: string, value: string): EqResult => {
            if (column === "id") {
              state.users = state.users.filter((user) => user.id !== value);
            }

            return { error: null };
          },
        };
      },
    };
  }

  function noopTenantTable() {
    return {
      update() {
        return {
          eq: async (): EqResult => ({ error: null }),
        };
      },
    };
  }

  return {
    state,
    client: {
      rpc(fn: string, args: Record<string, unknown>) {
        if (fn !== "move_user_references") {
          throw new Error(`Unexpected rpc call: ${fn}`);
        }

        if (
          args.from_user_id &&
          typeof args.from_user_id === "string" &&
          args.to_user_id &&
          typeof args.to_user_id === "string"
        ) {
          return Promise.resolve({ data: null, error: null });
        }

        return Promise.resolve({
          data: null,
          error: { message: "Invalid rpc arguments." },
        });
      },
      schema(schemaName: string) {
        if (schemaName !== "public") {
          throw new Error(`Unexpected schema: ${schemaName}`);
        }

        return {
          from(table: string) {
            if (table !== "users") {
              throw new Error(`Unexpected public table: ${table}`);
            }

            return publicUsersTable();
          },
        };
      },
      from(table: string) {
        const allowedTables = new Set([
          "saved_estimates",
          "business_profiles",
          "user_materials",
          "businesses",
          "memberships",
          "organizations",
          "leads",
        ]);

        if (!allowedTables.has(table)) {
          throw new Error(`Unexpected tenant table: ${table}`);
        }

        return noopTenantTable();
      },
    },
  };
}

describe("ensurePublicUserRecord", () => {
  it("recovers from an email conflict raised during update and reconciles the legacy row", async () => {
    const { client, state } = createMockSupabaseClient([
      {
        id: "current-user",
        name: "Sam Builder",
        email: null,
        image: null,
      },
      {
        id: "legacy-user",
        name: "Samuel Builder",
        email: "sam@example.com",
        image: "legacy.png",
      },
    ]);

    const userId = await ensurePublicUserRecord(
      client as never,
      {
        id: "current-user",
        name: "Sam Builder",
        email: "sam@example.com",
        image: null,
      },
    );

    expect(userId).toBe("current-user");
    expect(state.users).toHaveLength(1);
    expect(state.users[0]).toMatchObject({
      id: "current-user",
      email: "sam@example.com",
      name: "Sam Builder",
      image: "legacy.png",
    });
  });

  it("creates a new public user record when no existing rows are present", async () => {
    const { client, state } = createMockSupabaseClient([]);

    const userId = await ensurePublicUserRecord(client as never, {
      id: "new-user",
      name: "Nina Builder",
      email: "nina@example.com",
      image: "nina.png",
    });

    expect(userId).toBe("new-user");
    expect(state.users).toEqual([
      {
        id: "new-user",
        name: "Nina Builder",
        email: "nina@example.com",
        image: "nina.png",
        emailVerified: null,
        pro_mode_enabled: null,
      },
    ]);
  });

  it("updates an existing public user without an email conflict", async () => {
    const { client, state } = createMockSupabaseClient(
      [
        {
          id: "current-user",
          name: "Old Name",
          email: "old@example.com",
          image: "old.png",
        },
      ],
      { disableCurrentUserEmailConflict: true },
    );

    const userId = await ensurePublicUserRecord(client as never, {
      id: "current-user",
      name: "Updated Name",
      email: "updated@example.com",
      image: "updated.png",
    });

    expect(userId).toBe("current-user");
    expect(state.users).toEqual([
      {
        id: "current-user",
        name: "Updated Name",
        email: "updated@example.com",
        image: "updated.png",
      },
    ]);
  });

  it("returns the user id without throwing when public.users is missing", async () => {
    const { client, state } = createMockSupabaseClient([], {
      missingPublicUsersTable: true,
    });

    const userId = await ensurePublicUserRecord(client as never, {
      id: "missing-table-user",
      name: "Fallback User",
      email: "fallback@example.com",
      image: null,
    });

    expect(userId).toBe("missing-table-user");
    expect(state.users).toEqual([]);
  });

  it("handles a user with no email without triggering conflict logic", async () => {
    const { client, state } = createMockSupabaseClient([
      {
        id: "current-user",
        name: "No Email Yet",
        email: "old@example.com",
        image: "old.png",
      },
    ]);

    const userId = await ensurePublicUserRecord(client as never, {
      id: "current-user",
      name: "No Email Yet",
      email: undefined,
      image: null,
    });

    expect(userId).toBe("current-user");
    expect(state.emailLookups).toBe(0);
    expect(state.users).toEqual([
      {
        id: "current-user",
        name: "No Email Yet",
        email: null,
        image: "old.png",
      },
    ]);
  });
});
