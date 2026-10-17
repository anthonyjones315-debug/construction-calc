import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getClientsRoute, POST as createClientRoute } from "@/app/api/clients/route";
import {
  GET as getClientByIdRoute,
  PATCH as updateClientByIdRoute,
  DELETE as deleteClientByIdRoute,
} from "@/app/api/clients/[id]/route";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

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

import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/dal/clients";

describe("Clients API Security & Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/clients", () => {
    it("returns 401 Unauthorized when user is not authenticated", async () => {
      vi.mocked(getClients).mockRejectedValue(new UnauthorizedError());

      const response = await getClientsRoute();
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("returns 500 Internal Server Error without leaking internal db error details", async () => {
      vi.mocked(getClients).mockRejectedValue(
        new Error("postgres connection error: FATAL: password authentication failed"),
      );

      const response = await getClientsRoute();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("postgres connection error");
    });
  });

  describe("POST /api/clients", () => {
    it("returns 401 Unauthorized when unauthenticated", async () => {
      vi.mocked(createClient).mockRejectedValue(new UnauthorizedError());

      const req = new NextRequest("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Acme Corp" }),
      });

      const response = await createClientRoute(req);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("returns 500 Internal Server Error without leaking internal error details on failure", async () => {
      vi.mocked(createClient).mockRejectedValue(
        new Error("duplicate key value violates unique constraint 'clients_pkey'"),
      );

      const req = new NextRequest("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Acme Corp" }),
      });

      const response = await createClientRoute(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("unique constraint");
    });
  });

  describe("GET /api/clients/[id]", () => {
    it("returns 401 Unauthorized when unauthenticated", async () => {
      vi.mocked(getClient).mockRejectedValue(new UnauthorizedError());

      const req = new NextRequest("http://localhost/api/clients/123");
      const response = await getClientByIdRoute(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("returns 500 Internal Server Error without leaking error details on internal failure", async () => {
      vi.mocked(getClient).mockRejectedValue(
        new Error("Failed to load client: database schema corrupt"),
      );

      const req = new NextRequest("http://localhost/api/clients/123");
      const response = await getClientByIdRoute(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("database schema corrupt");
    });
  });

  describe("PATCH /api/clients/[id]", () => {
    it("returns 401 Unauthorized when unauthenticated", async () => {
      vi.mocked(updateClient).mockRejectedValue(new UnauthorizedError());

      const req = new NextRequest("http://localhost/api/clients/123", {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      });
      const response = await updateClientByIdRoute(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("returns 500 Internal Server Error on unexpected internal failure", async () => {
      vi.mocked(updateClient).mockRejectedValue(
        new Error("Failed to update client: permission denied for table clients"),
      );

      const req = new NextRequest("http://localhost/api/clients/123", {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      });
      const response = await updateClientByIdRoute(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("permission denied");
    });
  });

  describe("DELETE /api/clients/[id]", () => {
    it("returns 401 Unauthorized when unauthenticated", async () => {
      vi.mocked(deleteClient).mockRejectedValue(new UnauthorizedError());

      const req = new NextRequest("http://localhost/api/clients/123", {
        method: "DELETE",
      });
      const response = await deleteClientByIdRoute(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("returns 500 Internal Server Error on unexpected internal failure", async () => {
      vi.mocked(deleteClient).mockRejectedValue(
        new Error("Failed to delete client: foreign key constraint violation"),
      );

      const req = new NextRequest("http://localhost/api/clients/123", {
        method: "DELETE",
      });
      const response = await deleteClientByIdRoute(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("foreign key constraint");
    });
  });
});
