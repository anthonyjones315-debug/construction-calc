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

function createMockSupabaseClient(initialUsers: MockUserRow[]) {
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
});
