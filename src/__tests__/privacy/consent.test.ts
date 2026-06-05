import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const COOKIE_CONSENT_CHANGED_EVENT = "bcp:cookie-consent-changed";

describe("consent.ts", () => {
  let readConsentState: any;
  let hasConsentFor: any;
  let readCookieConsent: any;
  let notifyConsentChanged: any;

  beforeEach(async () => {
    // Reset modules to clear inMemoryConsentState between tests
    vi.resetModules();

    // Make sure global window exists
    if (typeof global.window === "undefined") {
      // @ts-ignore
      global.window = {};
    }

    // Clear global window.Termly
    delete global.window.Termly;

    // Provide a mock dispatchEvent if not exists
    global.window.dispatchEvent = vi.fn();

    // Spy on window.dispatchEvent
    vi.spyOn(global.window, "dispatchEvent");

    // Dynamically import to ensure fresh module state
    const module = await import("@/lib/privacy/consent");
    readConsentState = module.readConsentState;
    hasConsentFor = module.hasConsentFor;
    readCookieConsent = module.readCookieConsent;
    notifyConsentChanged = module.notifyConsentChanged;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("readConsentState", () => {
    it("returns null if window.Termly is not defined and no in-memory state exists", () => {
      expect(readConsentState()).toBeNull();
    });

    it("returns sanitized Termly consent state when available", () => {
      global.window.Termly = {
        getConsentState: () => ({
          performance: true,
          advertising: false,
        }),
      };

      const state = readConsentState();
      expect(state).toEqual({
        performance: true,
        advertising: false,
      });
    });

    it("caches the Termly consent state in memory", () => {
      const getConsentStateMock = vi.fn().mockReturnValue({
        performance: true,
      });
      global.window.Termly = {
        getConsentState: getConsentStateMock,
      };

      // First call fetches from Termly
      expect(readConsentState()).toEqual({ performance: true });
      expect(getConsentStateMock).toHaveBeenCalledTimes(1);

      // Change Termly to return something else, but let's say it returns undefined or null
      getConsentStateMock.mockReturnValue(null);

      // Should return the cached value since Termly returned null
      expect(readConsentState()).toEqual({ performance: true });
      expect(getConsentStateMock).toHaveBeenCalledTimes(2);
    });

    it("returns inMemoryConsentState when window is undefined", async () => {
      // First, set up inMemoryConsentState by running in a simulated browser env
      global.window.Termly = {
        getConsentState: () => ({ performance: true }),
      };
      readConsentState(); // caches it

      // Now simulate SSR / no window
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      try {
        expect(readConsentState()).toEqual({ performance: true });
      } finally {
        global.window = originalWindow;
      }
    });
  });

  describe("hasConsentFor", () => {
    it("returns true if consent is granted for a specific category", () => {
      global.window.Termly = {
        getConsentState: () => ({ performance: true, advertising: false }),
      };

      expect(hasConsentFor("performance")).toBe(true);
    });

    it("returns false if consent is denied for a specific category", () => {
      global.window.Termly = {
        getConsentState: () => ({ performance: true, advertising: false }),
      };

      expect(hasConsentFor("advertising")).toBe(false);
    });

    it("returns false if consent state is null", () => {
      expect(hasConsentFor("performance")).toBe(false);
    });
  });

  describe("readCookieConsent", () => {
    it("returns null if no consent state exists", () => {
      expect(readCookieConsent()).toBeNull();
    });

    it("returns 'accepted' if at least one optional category is true", () => {
      global.window.Termly = {
        getConsentState: () => ({ performance: true, advertising: false }),
      };

      expect(readCookieConsent()).toBe("accepted");
    });

    it("returns 'rejected' if no optional categories are true", () => {
      global.window.Termly = {
        getConsentState: () => ({
          essential: true,
          performance: false,
          analytics: false,
          advertising: false,
          social_networking: false,
        }),
      };

      expect(readCookieConsent()).toBe("rejected");
    });

    it("returns 'rejected' if optional categories are undefined", () => {
      global.window.Termly = {
        getConsentState: () => ({
          essential: true,
        }),
      };

      expect(readCookieConsent()).toBe("rejected");
    });
  });

  describe("notifyConsentChanged", () => {
    it("does nothing if window is undefined", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      try {
        notifyConsentChanged({ performance: true });
      } finally {
        global.window = originalWindow;
      }
      expect(originalWindow.dispatchEvent).not.toHaveBeenCalled();
    });

    it("dispatches COOKIE_CONSENT_CHANGED_EVENT with current consent state", () => {
      global.window.Termly = {
        getConsentState: () => ({ performance: true }),
      };

      notifyConsentChanged();

      expect(global.window.dispatchEvent).toHaveBeenCalledTimes(1);
      const event = vi.mocked(global.window.dispatchEvent).mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe(COOKIE_CONSENT_CHANGED_EVENT);
      expect(event.detail).toBe("accepted");
    });

    it("updates inMemoryConsentState if state is provided", () => {
      // Pass explicitly
      notifyConsentChanged({ advertising: true });

      // Ensure it updated the in-memory state so readCookieConsent sees it
      expect(readCookieConsent()).toBe("accepted");
      expect(hasConsentFor("advertising")).toBe(true);

      const event = vi.mocked(global.window.dispatchEvent).mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe(COOKIE_CONSENT_CHANGED_EVENT);
      expect(event.detail).toBe("accepted");
    });
  });
});
