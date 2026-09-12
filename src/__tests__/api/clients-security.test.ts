import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/dal/clients", () => ({
  getClients: vi.fn(),
  createClient: vi.fn(),
  getClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";
import { getClients, createClient, getClient, updateClient, deleteClient } from "@/lib/dal/clients";
import { GET as getClientsRoute, POST as createClientRoute } from "@/app/api/clients/route";
import {
  GET as getClientByIdRoute,
  PATCH as updateClientByIdRoute,
  DELETE as deleteClientByIdRoute,
} from "@/app/api/clients/[id]/route";

describe("Clients API Security & Error Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("/api/clients", () => {
    it("returns 401 Unauthorized when getClients throws UnauthorizedError", async () => {
      vi.mocked(getClients).mockRejectedValueOnce(new UnauthorizedError());

      const res = await getClientsRoute();
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("returns 500 Internal Server Error without leaking internal database error details on unexpected getClients failure", async () => {
      vi.mocked(getClients).mockRejectedValueOnce(
        new Error("Failed to load clients: relation 'clients' does not exist"),
      );

      const res = await getClientsRoute();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it("returns 401 Unauthorized when createClient throws UnauthorizedError", async () => {
      vi.mocked(createClient).mockRejectedValueOnce(new UnauthorizedError());

      const req = new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Acme Corp" }),
      });

      const res = await createClientRoute(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("returns 500 Internal Server Error without leaking details on unexpected createClient failure", async () => {
      vi.mocked(createClient).mockRejectedValueOnce(
        new Error("Failed to create client: duplicate key value violates unique constraint"),
      );

      const req = new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Acme Corp" }),
      });

      const res = await createClientRoute(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  describe("/api/clients/[id]", () => {
    const params = Promise.resolve({ id: "client-123" });

    it("returns 401 Unauthorized when getClient throws UnauthorizedError", async () => {
      vi.mocked(getClient).mockRejectedValueOnce(new UnauthorizedError());

      const req = new Request("http://localhost/api/clients/client-123");
      const res = await getClientByIdRoute(req, { params });
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("returns 500 Internal Server Error without leaking internal database error details on unexpected getClient failure", async () => {
      vi.mocked(getClient).mockRejectedValueOnce(
        new Error("Failed to load client: connection terminated unexpectedly"),
      );

      const req = new Request("http://localhost/api/clients/client-123");
      const res = await getClientByIdRoute(req, { params });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it("returns 404 Not Found when client update targets non-existent client", async () => {
      vi.mocked(updateClient).mockRejectedValueOnce(
        new Error("Client not found or unauthorized."),
      );

      const req = new Request("http://localhost/api/clients/client-123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const res = await updateClientByIdRoute(req, { params });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body).toEqual({ error: "Not found" });
    });

    it("returns 500 Internal Server Error on unexpected updateClient error", async () => {
      vi.mocked(updateClient).mockRejectedValueOnce(
        new Error("Failed to update client: syntax error at or near WHERE"),
      );

      const req = new Request("http://localhost/api/clients/client-123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const res = await updateClientByIdRoute(req, { params });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it("returns 401 Unauthorized when deleteClient throws UnauthorizedError", async () => {
      vi.mocked(deleteClient).mockRejectedValueOnce(new UnauthorizedError());

      const req = new Request("http://localhost/api/clients/client-123", {
        method: "DELETE",
      });

      const res = await deleteClientByIdRoute(req, { params });
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("returns 500 Internal Server Error on unexpected deleteClient failure", async () => {
      vi.mocked(deleteClient).mockRejectedValueOnce(
        new Error("Failed to delete client: foreign key constraint violation"),
      );

      const req = new Request("http://localhost/api/clients/client-123", {
        method: "DELETE",
      });

      const res = await deleteClientByIdRoute(req, { params });
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });
});
