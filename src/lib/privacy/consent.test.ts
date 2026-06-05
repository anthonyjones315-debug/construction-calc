import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Privacy Consent API", () => {
  let originalWindow: typeof window;

  beforeEach(() => {
    originalWindow = global.window;
    vi.resetModules();
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe("readConsentState", () => {
    it("returns null when window is undefined (SSR)", async () => {
      // @ts-expect-error simulating SSR
      delete global.window;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toBeNull();
    });

    it("returns inMemoryConsentState if window is defined but Termly is not", async () => {
      global.window = {} as unknown as typeof window;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toBeNull(); // Initially null
    });

    it("returns sanitized Termly consent state and caches it", async () => {
      global.window = {
        Termly: {
          getConsentState: () => ({ essential: true, performance: false }),
        },
      } as unknown as typeof window;

      const { readConsentState } = await import("./consent");
      const state = readConsentState();
      expect(state).toEqual({ essential: true, performance: false });
    });
  });

  describe("hasConsentFor", () => {
    it("returns true if category is consented", async () => {
      global.window = {
        Termly: {
          getConsentState: () => ({ analytics: true }),
        },
      } as unknown as typeof window;

      const { hasConsentFor } = await import("./consent");
      expect(hasConsentFor("analytics")).toBe(true);
    });

    it("returns false if category is not consented", async () => {
      global.window = {
        Termly: {
          getConsentState: () => ({ analytics: false }),
        },
      } as unknown as typeof window;

      const { hasConsentFor } = await import("./consent");
      expect(hasConsentFor("analytics")).toBe(false);
    });

    it("returns false if consent state is null", async () => {
      global.window = {
        Termly: {
          getConsentState: () => null,
        },
      } as unknown as typeof window;

      const { hasConsentFor } = await import("./consent");
      expect(hasConsentFor("analytics")).toBe(false);
    });
  });

  describe("readCookieConsent", () => {
    it("returns null if consent state is null", async () => {
      global.window = {
        Termly: {
          getConsentState: () => null,
        },
      } as unknown as typeof window;

      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBeNull();
    });

    it("returns 'accepted' if any optional category is true", async () => {
      global.window = {
        Termly: {
          getConsentState: () => ({ essential: true, performance: true }),
        },
      } as unknown as typeof window;

      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBe("accepted");
    });

    it("returns 'rejected' if all optional categories are false or undefined", async () => {
      global.window = {
        Termly: {
          getConsentState: () => ({ essential: true, performance: false }),
        },
      } as unknown as typeof window;

      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBe("rejected");
    });
  });

  describe("notifyConsentChanged", () => {
    it("does nothing when window is undefined", async () => {
      // @ts-expect-error simulating SSR
      delete global.window;
      const { notifyConsentChanged } = await import("./consent");
      expect(() => notifyConsentChanged()).not.toThrow();
    });

    it("dispatches COOKIE_CONSENT_CHANGED_EVENT and updates state", async () => {
      global.window = {
        dispatchEvent: vi.fn(),
        Termly: {
          getConsentState: () => ({ analytics: true }),
        },
      } as unknown as typeof window;

      const { notifyConsentChanged, COOKIE_CONSENT_CHANGED_EVENT } = await import("./consent");
      notifyConsentChanged({ analytics: true });

      expect(global.window.dispatchEvent).toHaveBeenCalled();
      const eventCall = (global.window.dispatchEvent as import("vitest").Mock).mock.calls[0][0];
      expect(eventCall.type).toBe(COOKIE_CONSENT_CHANGED_EVENT);
      expect(eventCall.detail).toBe("accepted");
    });
  });
});
