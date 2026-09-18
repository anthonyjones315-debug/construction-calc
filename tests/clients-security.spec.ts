import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/dal/clients", () => ({
  getClients: vi.fn(),
  getClient: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { GET as getClientsApi, POST as createClientApi } from "@/app/api/clients/route";
import {
  GET as getClientByIdApi,
  PATCH as updateClientApi,
  DELETE as deleteClientApi,
} from "@/app/api/clients/[id]/route";
import { POST as syncClientApi } from "@/app/api/clients/sync/route";
import { getClients, createClient, getClient, updateClient, deleteClient } from "@/lib/dal/clients";
import { auth } from "@/lib/auth/config";

describe("Clients API Security & Error Hardening", () => {
  it("GET /api/clients returns 401 for UnauthorizedError without leaking internal details", async () => {
    vi.mocked(getClients).mockRejectedValueOnce(new UnauthorizedError());

    const res = await getClientsApi();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("GET /api/clients returns 500 with generic error message on unexpected internal/database error", async () => {
    vi.mocked(getClients).mockRejectedValueOnce(
      new Error("PGRST301: column 'secret_db_info' does not exist in table 'clients'"),
    );

    const res = await getClientsApi();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(data)).not.toContain("PGRST301");
    expect(JSON.stringify(data)).not.toContain("secret_db_info");
  });

  it("POST /api/clients returns generic error on failure without exposing database schema", async () => {
    vi.mocked(createClient).mockRejectedValueOnce(
      new Error("violates foreign key constraint 'fk_user_id_internal'"),
    );

    const req = new Request("http://localhost/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: "Test Client" }),
    });

    const res = await createClientApi(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Failed to create client" });
    expect(JSON.stringify(data)).not.toContain("fk_user_id_internal");
  });

  it("GET /api/clients/[id] returns generic 500 error when database query fails", async () => {
    vi.mocked(getClient).mockRejectedValueOnce(
      new Error("Database connection timeout at postgres://admin:secret@db.internal:5432"),
    );

    const req = new Request("http://localhost/api/clients/123");
    const params = Promise.resolve({ id: "123" });

    const res = await getClientByIdApi(req, { params });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(data)).not.toContain("db.internal");
  });

  it("PATCH /api/clients/[id] returns generic 400 error on update failure", async () => {
    vi.mocked(updateClient).mockRejectedValueOnce(
      new Error("syntax error at or near 'SELECT'"),
    );

    const req = new Request("http://localhost/api/clients/123", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Client" }),
    });
    const params = Promise.resolve({ id: "123" });

    const res = await updateClientApi(req, { params });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Failed to update client" });
    expect(JSON.stringify(data)).not.toContain("syntax error");
  });

  it("DELETE /api/clients/[id] returns generic 400 error on deletion failure", async () => {
    vi.mocked(deleteClient).mockRejectedValueOnce(
      new Error("table lock timeout"),
    );

    const req = new Request("http://localhost/api/clients/123", {
      method: "DELETE",
    });
    const params = Promise.resolve({ id: "123" });

    const res = await deleteClientApi(req, { params });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: "Failed to delete client" });
    expect(JSON.stringify(data)).not.toContain("table lock");
  });

  it("POST /api/clients/sync returns 401 when user session is missing", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/clients/sync", {
      method: "POST",
      body: JSON.stringify({ name: "Sync Client" }),
    });

    const res = await syncClientApi(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });
});
