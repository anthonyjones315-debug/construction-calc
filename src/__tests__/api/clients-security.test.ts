import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { GET as getClientsRoute, POST as createClientRoute } from "@/app/api/clients/route";
import { GET as getClientByIdRoute, PATCH as updateClientByIdRoute, DELETE as deleteClientByIdRoute } from "@/app/api/clients/[id]/route";
import * as clientsDal from "@/lib/dal/clients";
import { UnauthorizedError } from "@/lib/errors/unauthorized";

vi.mock("@/lib/dal/clients");
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Clients API Security & Error Handling", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /api/clients", () => {
    it("returns 401 Unauthorized when user is not authenticated", async () => {
      vi.mocked(clientsDal.getClients).mockRejectedValue(new UnauthorizedError("Authentication required"));

      const response = await getClientsRoute();
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("returns generic 500 without leaking raw database/driver error details", async () => {
      vi.mocked(clientsDal.getClients).mockRejectedValue(new Error("PGAERROR: connection to server at 'db.internal.cloud' failed: fatal password error"));

      const response = await getClientsRoute();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("PGAERROR");
      expect(JSON.stringify(body)).not.toContain("db.internal.cloud");
    });
  });

  describe("POST /api/clients", () => {
    it("returns 401 Unauthorized when user is not authenticated", async () => {
      vi.mocked(clientsDal.createClient).mockRejectedValue(new UnauthorizedError("Authentication required"));

      const request = new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Test Client" }),
      });
      const response = await createClientRoute(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("returns generic 500 without leaking database details on insertion failure", async () => {
      vi.mocked(clientsDal.createClient).mockRejectedValue(new Error("duplicate key value violates unique constraint 'clients_email_key'"));

      const request = new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({ name: "Test Client", email: "test@example.com" }),
      });
      const response = await createClientRoute(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("clients_email_key");
    });
  });

  describe("/api/clients/[id]", () => {
    const params = Promise.resolve({ id: "client-123" });

    it("GET returns generic 500 on database failure", async () => {
      vi.mocked(clientsDal.getClient).mockRejectedValue(new Error("relation 'public.clients' does not exist"));

      const request = new Request("http://localhost/api/clients/client-123");
      const response = await getClientByIdRoute(request, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("public.clients");
    });

    it("PATCH returns 401 when unauthorized", async () => {
      vi.mocked(clientsDal.updateClient).mockRejectedValue(new UnauthorizedError());

      const request = new Request("http://localhost/api/clients/client-123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });
      const response = await updateClientByIdRoute(request, { params });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("DELETE returns generic 500 on unexpected error", async () => {
      vi.mocked(clientsDal.deleteClient).mockRejectedValue(new Error("Connection reset by peer"));

      const request = new Request("http://localhost/api/clients/client-123", { method: "DELETE" });
      const response = await deleteClientByIdRoute(request, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(JSON.stringify(body)).not.toContain("Connection reset by peer");
    });
  });
});
