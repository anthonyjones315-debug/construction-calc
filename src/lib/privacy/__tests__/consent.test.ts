import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Define the type to match what we import
import type * as ConsentModule from "../consent";

describe("Privacy Consent API", () => {
  let consentModule: typeof ConsentModule;

  beforeEach(async () => {
    // Isolate module state for each test
    vi.resetModules();
    // Re-import the module to get a fresh inMemoryConsentState
    consentModule = await import("../consent");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("readConsentState", () => {
    it("returns in-memory state when window is undefined (server environment)", () => {
      // Vitest node environment has no window by default unless configured,
      // but just to be sure we can stub it if it exists.
      vi.stubGlobal("window", undefined);
      expect(consentModule.readConsentState()).toBeNull();
    });

    it("returns termly state and updates memory when window.Termly is valid", () => {
      const mockState = { essential: true, analytics: false };
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue(mockState),
        },
      });

      const result = consentModule.readConsentState();
      expect(result).toEqual(mockState);

      // The second call should also return the same if Termly still returns it
      // or if window is undefined later, it should return the cached in-memory state.
      vi.stubGlobal("window", undefined);
      expect(consentModule.readConsentState()).toEqual(mockState);
    });

    it("sanitizes invalid termly state (removes unknown categories)", () => {
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({
            essential: true,
            unknown_category: true,
            analytics: "yes", // invalid type, should be ignored
          }),
        },
      });

      const result = consentModule.readConsentState();
      expect(result).toEqual({ essential: true });
    });

    it("returns null if termly state is completely invalid/empty", () => {
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({
            unknown: true,
          }),
        },
      });

      const result = consentModule.readConsentState();
      expect(result).toBeNull();
    });

    it("returns in-memory state if Termly state is missing but memory has it", () => {
      // First set the in-memory state
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({ essential: true }),
        },
      });
      consentModule.readConsentState(); // Sets inMemoryConsentState

      // Now remove Termly
      vi.stubGlobal("window", {});
      const result = consentModule.readConsentState();
      expect(result).toEqual({ essential: true });
    });
  });

  describe("hasConsentFor", () => {
    it("returns true if category is explicitly true", () => {
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({ analytics: true, advertising: false }),
        },
      });

      expect(consentModule.hasConsentFor("analytics")).toBe(true);
    });

    it("returns false if category is false", () => {
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({ analytics: true, advertising: false }),
        },
      });

      expect(consentModule.hasConsentFor("advertising")).toBe(false);
    });

    it("returns false if category is missing", () => {
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({ analytics: true }),
        },
      });

      expect(consentModule.hasConsentFor("performance")).toBe(false);
    });

    it("returns false if consent state is null", () => {
      vi.stubGlobal("window", undefined);
      expect(consentModule.hasConsentFor("essential")).toBe(false);
    });
  });

  describe("readCookieConsent", () => {
    it("returns 'accepted' if any optional category is true", () => {
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({ performance: true, essential: false }),
        },
      });

      expect(consentModule.readCookieConsent()).toBe("accepted");
    });

    it("returns 'rejected' if no optional categories are true", () => {
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({ essential: true, performance: false }),
        },
      });

      expect(consentModule.readCookieConsent()).toBe("rejected");
    });

    it("returns null if consent state is null", () => {
      vi.stubGlobal("window", undefined);
      expect(consentModule.readCookieConsent()).toBeNull();
    });
  });

  describe("notifyConsentChanged", () => {
    it("returns early if window is undefined", () => {
      vi.stubGlobal("window", undefined);

      // Should not throw
      consentModule.notifyConsentChanged({ essential: true });

      // Verify in-memory state was not updated (since we returned early)
      expect(consentModule.readConsentState()).toBeNull();
    });

    it("updates in-memory state and dispatches event when state is provided", () => {
      const mockDispatchEvent = vi.fn();
      vi.stubGlobal("window", {
        dispatchEvent: mockDispatchEvent,
      });

      consentModule.notifyConsentChanged({ analytics: true });

      // In-memory state should be updated
      expect(consentModule.readConsentState()).toEqual({ analytics: true });

      // Event should be dispatched
      expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
      const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe(consentModule.COOKIE_CONSENT_CHANGED_EVENT);
      // readCookieConsent should be 'accepted' because analytics is an optional category
      expect(event.detail).toBe("accepted");
    });

    it("falls back to readConsentState if state arg is not provided", () => {
      const mockDispatchEvent = vi.fn();
      vi.stubGlobal("window", {
        Termly: {
          getConsentState: vi.fn().mockReturnValue({ advertising: true }),
        },
        dispatchEvent: mockDispatchEvent,
      });

      consentModule.notifyConsentChanged();

      // In-memory state should be updated via readConsentState fallback
      expect(consentModule.readConsentState()).toEqual({ advertising: true });

      expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
      const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toBe("accepted");
    });

    it("sanitizes provided state", () => {
      const mockDispatchEvent = vi.fn();
      vi.stubGlobal("window", {
        dispatchEvent: mockDispatchEvent,
      });

      // @ts-expect-error intentionally passing invalid data
      consentModule.notifyConsentChanged({ essential: true, unknown: true, performance: "yes" });

      // In-memory state should only have essential
      expect(consentModule.readConsentState()).toEqual({ essential: true });

      const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toBe("rejected"); // essential is not optional
    });
  });
});
