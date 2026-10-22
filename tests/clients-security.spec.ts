import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { GET as getClientsRoute, POST as postClientsRoute } from "@/app/api/clients/route";
import { GET as getClientRoute, PATCH as patchClientRoute, DELETE as deleteClientRoute } from "@/app/api/clients/[id]/route";
import * as clientsDal from "@/lib/dal/clients";
import * as Sentry from "@sentry/nextjs";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

vi.mock("@/lib/dal/clients");
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Clients API Security & Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/clients", () => {
    it("returns 401 when UnauthorizedError is thrown", async () => {
      vi.spyOn(clientsDal, "getClients").mockRejectedValueOnce(new UnauthorizedError());

      const res = await getClientsRoute();
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("captures exception and returns 500 without leaking error details when a DB error occurs", async () => {
      const dbError = new Error("PGRST301: connection timeout to DB at postgres://secret-db:5432");
      vi.spyOn(clientsDal, "getClients").mockRejectedValueOnce(dbError);

      const res = await getClientsRoute();
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalledWith(dbError);
    });
  });

  describe("POST /api/clients", () => {
    it("returns 401 when UnauthorizedError is thrown", async () => {
      vi.spyOn(clientsDal, "createClient").mockRejectedValueOnce(new UnauthorizedError());

      const req = new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Acme Corp" }),
      });
      const res = await postClientsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("captures exception and returns 500 on unexpected errors", async () => {
      const dbError = new Error("Database insert failed");
      vi.spyOn(clientsDal, "createClient").mockRejectedValueOnce(dbError);

      const req = new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Acme Corp" }),
      });
      const res = await postClientsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalledWith(dbError);
    });
  });

  describe("GET /api/clients/[id]", () => {
    it("returns 401 when UnauthorizedError is thrown", async () => {
      vi.spyOn(clientsDal, "getClient").mockRejectedValueOnce(new UnauthorizedError());

      const req = new Request("http://localhost/api/clients/123");
      const res = await getClientRoute(req, { params: Promise.resolve({ id: "123" }) });
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("captures exception and returns 500 without leaking error details", async () => {
      const dbError = new Error("Sensitive DB Query Error");
      vi.spyOn(clientsDal, "getClient").mockRejectedValueOnce(dbError);

      const req = new Request("http://localhost/api/clients/123");
      const res = await getClientRoute(req, { params: Promise.resolve({ id: "123" }) });
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalledWith(dbError);
    });
  });

  describe("PATCH /api/clients/[id]", () => {
    it("returns 401 when UnauthorizedError is thrown", async () => {
      vi.spyOn(clientsDal, "updateClient").mockRejectedValueOnce(new UnauthorizedError());

      const req = new Request("http://localhost/api/clients/123", {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      });
      const res = await patchClientRoute(req, { params: Promise.resolve({ id: "123" }) });
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("captures exception and returns 500 on unexpected errors", async () => {
      const dbError = new Error("Failed to update");
      vi.spyOn(clientsDal, "updateClient").mockRejectedValueOnce(dbError);

      const req = new Request("http://localhost/api/clients/123", {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      });
      const res = await patchClientRoute(req, { params: Promise.resolve({ id: "123" }) });
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalledWith(dbError);
    });
  });

  describe("DELETE /api/clients/[id]", () => {
    it("returns 401 when UnauthorizedError is thrown", async () => {
      vi.spyOn(clientsDal, "deleteClient").mockRejectedValueOnce(new UnauthorizedError());

      const req = new Request("http://localhost/api/clients/123", { method: "DELETE" });
      const res = await deleteClientRoute(req, { params: Promise.resolve({ id: "123" }) });
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("captures exception and returns 500 on unexpected errors", async () => {
      const dbError = new Error("Failed to delete");
      vi.spyOn(clientsDal, "deleteClient").mockRejectedValueOnce(dbError);

      const req = new Request("http://localhost/api/clients/123", { method: "DELETE" });
      const res = await deleteClientRoute(req, { params: Promise.resolve({ id: "123" }) });
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json).toEqual({ error: "Internal Server Error" });
      expect(Sentry.captureException).toHaveBeenCalledWith(dbError);
    });
  });
});
