import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/dal/clients");

import { GET as getClients, POST as createClient } from "@/app/api/clients/route";
import { GET as getClient } from "@/app/api/clients/[id]/route";
import * as clientsDal from "@/lib/dal/clients";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

describe("Clients API Security", () => {
  it("returns 401 when unauthenticated on GET /api/clients", async () => {
    vi.spyOn(clientsDal, "getClients").mockRejectedValueOnce(new UnauthorizedError());

    const res = await getClients();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 500 without leaking database details on GET /api/clients error", async () => {
    vi.spyOn(clientsDal, "getClients").mockRejectedValueOnce(
      new Error("PG::Error: SELECT * FROM clients WHERE secret_db_column_leak")
    );

    const res = await getClients();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(body)).not.toContain("secret_db_column_leak");
  });

  it("returns 401 when unauthenticated on POST /api/clients", async () => {
    vi.spyOn(clientsDal, "createClient").mockRejectedValueOnce(new UnauthorizedError());

    const req = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: "Test Client" }),
    });
    const res = await createClient(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 without leaking database details on POST /api/clients error", async () => {
    vi.spyOn(clientsDal, "createClient").mockRejectedValueOnce(
      new Error("db column error: constraint violate user_id_fkey")
    );

    const req = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: "Test Client" }),
    });
    const res = await createClient(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Failed to create client" });
    expect(JSON.stringify(body)).not.toContain("user_id_fkey");
  });

  it("returns 401 when unauthenticated on GET /api/clients/[id]", async () => {
    vi.spyOn(clientsDal, "getClient").mockRejectedValueOnce(new UnauthorizedError());

    const req = new Request("http://localhost/api/clients/123");
    const params = Promise.resolve({ id: "123" });
    const res = await getClient(req, { params });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 500 without leaking details on GET /api/clients/[id] error", async () => {
    vi.spyOn(clientsDal, "getClient").mockRejectedValueOnce(
      new Error("connection timeout postgresql://user:pass@host:5432/db")
    );

    const req = new Request("http://localhost/api/clients/123");
    const params = Promise.resolve({ id: "123" });
    const res = await getClient(req, { params });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(body)).not.toContain("postgresql://");
  });
});
