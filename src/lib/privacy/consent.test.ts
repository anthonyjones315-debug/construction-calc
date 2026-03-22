import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as consent from "./consent";

describe("consent.ts", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset in-memory state before each test
    // We achieve this by reloading the module or by knowing that the
    // internal cache `inMemoryConsentState` starts as null and is modified.
    // However, since it's a module level variable, we need to clear it or mock it.
    // The easiest way to reset the module state without complex module mocking is
    // to just trigger an event that sets it to null if possible, or we can use vi.resetModules.
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe("SSR environment (window is undefined)", () => {
    beforeEach(async () => {
      vi.resetModules();
      delete (global as any).window;
      // We must dynamically import to get a fresh module state since window is evaluated on import/call
    });

    it("readConsentState returns null initially", async () => {
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toBeNull();
    });

    it("hasConsentFor returns false", async () => {
      const { hasConsentFor } = await import("./consent");
      expect(hasConsentFor("analytics")).toBe(false);
    });

    it("readCookieConsent returns null", async () => {
      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBeNull();
    });

    it("notifyConsentChanged does nothing", async () => {
      const { notifyConsentChanged, readConsentState } = await import("./consent");
      expect(() => notifyConsentChanged({ analytics: true })).not.toThrow();
      expect(readConsentState()).toBeNull();
    });
  });

  describe("Browser environment (window is defined)", () => {
    let dispatchEventMock: any;
    let consentModule: typeof import("./consent");

    beforeEach(async () => {
      vi.resetModules();
      dispatchEventMock = vi.fn();

      (global as any).window = {
        dispatchEvent: dispatchEventMock,
        CustomEvent: class CustomEvent {
          type: string;
          detail: any;
          constructor(type: string, options: any) {
            this.type = type;
            this.detail = options?.detail;
          }
        }
      };

      (global as any).CustomEvent = (global as any).window.CustomEvent;

      consentModule = await import("./consent");
    });

    afterEach(() => {
      delete (global as any).CustomEvent;
    });

    it("readConsentState returns null if Termly is not defined", () => {
      expect(consentModule.readConsentState()).toBeNull();
    });

    it("readConsentState returns sanitized Termly state", () => {
      (global as any).window.Termly = {
        getConsentState: () => ({
          analytics: true,
          advertising: false,
          unknown_category: true, // Should be sanitized out
        }),
      };

      const state = consentModule.readConsentState();
      expect(state).toEqual({
        analytics: true,
        advertising: false,
      });
    });

    it("readConsentState returns null if Termly returns invalid state", () => {
      (global as any).window.Termly = {
        getConsentState: () => "invalid_string_state",
      };

      expect(consentModule.readConsentState()).toBeNull();
    });

    it("hasConsentFor checks specific categories", () => {
      (global as any).window.Termly = {
        getConsentState: () => ({
          analytics: true,
          essential: true,
        }),
      };

      expect(consentModule.hasConsentFor("analytics")).toBe(true);
      expect(consentModule.hasConsentFor("essential")).toBe(true);
      expect(consentModule.hasConsentFor("advertising")).toBe(false);
    });

    it("readCookieConsent returns accepted if any optional category is true", () => {
      (global as any).window.Termly = {
        getConsentState: () => ({
          analytics: true,
          advertising: false,
        }),
      };

      expect(consentModule.readCookieConsent()).toBe("accepted");
    });

    it("readCookieConsent returns rejected if all optional categories are false or unset", () => {
      (global as any).window.Termly = {
        getConsentState: () => ({
          essential: true, // Not an optional category for cookie consent choice
          analytics: false,
          advertising: false,
        }),
      };

      expect(consentModule.readCookieConsent()).toBe("rejected");
    });

    it("notifyConsentChanged updates memory state and dispatches event", () => {
      consentModule.notifyConsentChanged({ analytics: true });

      expect(consentModule.readConsentState()).toEqual({ analytics: true });

      expect(dispatchEventMock).toHaveBeenCalledTimes(1);
      const event = dispatchEventMock.mock.calls[0][0];
      expect(event.type).toBe("bcp:cookie-consent-changed");
      expect(event.detail).toBe("accepted");
    });

    it("notifyConsentChanged with no args reads from Termly", () => {
      (global as any).window.Termly = {
        getConsentState: () => ({ advertising: true }),
      };

      consentModule.notifyConsentChanged();

      expect(consentModule.readConsentState()).toEqual({ advertising: true });
      expect(dispatchEventMock).toHaveBeenCalledTimes(1);
      const event = dispatchEventMock.mock.calls[0][0];
      expect(event.detail).toBe("accepted");
    });

    it("caches state in memory (fallback when Termly returns nothing later)", () => {
      (global as any).window.Termly = {
        getConsentState: () => ({ analytics: true }),
      };

      expect(consentModule.readConsentState()).toEqual({ analytics: true });

      // Simulate Termly state becoming unavailable or returning null
      (global as any).window.Termly.getConsentState = () => null;

      // Should return the cached memory state
      expect(consentModule.readConsentState()).toEqual({ analytics: true });
    });
  });
});
