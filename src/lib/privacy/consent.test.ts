import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
} from "./consent";

describe("consent.ts", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe("readConsentState", () => {
    it("returns null when window is undefined", async () => {
      // @ts-ignore
      delete global.window;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toBeNull();
    });

    it("returns null when window.Termly is undefined", async () => {
      global.window = {} as any;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toBeNull();
    });

    it("returns null when window.Termly.getConsentState returns null", async () => {
      global.window = {
        Termly: { getConsentState: () => null },
      } as any;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toBeNull();
    });

    it("returns valid state and saves to memory when Termly provides it", async () => {
      global.window = {
        Termly: { getConsentState: () => ({ essential: true, analytics: false }) },
      } as any;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toEqual({ essential: true, analytics: false });
    });

    it("filters out invalid categories", async () => {
      global.window = {
        Termly: { getConsentState: () => ({ essential: true, invalid: true } as any) },
      } as any;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toEqual({ essential: true });
    });

    it("filters out non-boolean values", async () => {
      global.window = {
        Termly: { getConsentState: () => ({ essential: "true" } as any) },
      } as any;
      const { readConsentState } = await import("./consent");
      expect(readConsentState()).toBeNull();
    });

    it("returns inMemoryConsentState if Termly returns nothing but state was set previously", async () => {
      const state = { essential: true };
      global.window = {
        Termly: { getConsentState: () => state },
      } as any;
      const { readConsentState } = await import("./consent");
      readConsentState(); // Sets in memory state

      global.window.Termly!.getConsentState = () => null;
      expect(readConsentState()).toEqual(state);
    });
  });

  describe("hasConsentFor", () => {
    it("returns false if there is no state", async () => {
      global.window = {} as any;
      const { hasConsentFor } = await import("./consent");
      expect(hasConsentFor("essential")).toBe(false);
    });

    it("returns true if the category is consented", async () => {
      global.window = {
        Termly: { getConsentState: () => ({ analytics: true }) },
      } as any;
      const { hasConsentFor } = await import("./consent");
      expect(hasConsentFor("analytics")).toBe(true);
    });

    it("returns false if the category is not consented", async () => {
      global.window = {
        Termly: { getConsentState: () => ({ analytics: false }) },
      } as any;
      const { hasConsentFor } = await import("./consent");
      expect(hasConsentFor("analytics")).toBe(false);
    });
  });

  describe("readCookieConsent", () => {
    it("returns null if there is no state", async () => {
      global.window = {} as any;
      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBeNull();
    });

    it("returns 'accepted' if at least one optional category is consented", async () => {
      global.window = {
        Termly: { getConsentState: () => ({ essential: true, analytics: true }) },
      } as any;
      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBe("accepted");
    });

    it("returns 'rejected' if no optional categories are consented", async () => {
      global.window = {
        Termly: { getConsentState: () => ({ essential: true, analytics: false }) },
      } as any;
      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBe("rejected");
    });

    it("returns 'rejected' if state is present but empty", async () => {
      const state = { essential: true };
      global.window = {
        Termly: { getConsentState: () => state },
      } as any;
      const { readCookieConsent } = await import("./consent");
      expect(readCookieConsent()).toBe("rejected");
    });
  });

  describe("notifyConsentChanged", () => {
    it("does nothing when window is undefined", async () => {
      // @ts-ignore
      delete global.window;
      const { notifyConsentChanged } = await import("./consent");
      expect(() => notifyConsentChanged({ essential: true })).not.toThrow();
    });

    it("dispatches event with updated consent state when explicitly provided", async () => {
      const dispatchEventSpy = vi.fn();
      global.window = {
        dispatchEvent: dispatchEventSpy,
        Termly: { getConsentState: () => null }, // Return null so it uses memory state
      } as any;

      const { notifyConsentChanged } = await import("./consent");
      notifyConsentChanged({ essential: true, analytics: true });

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe(COOKIE_CONSENT_CHANGED_EVENT);
      expect(event.detail).toBe("accepted");
    });

    it("dispatches event with termly state when no state is explicitly provided", async () => {
      const dispatchEventSpy = vi.fn();
      global.window = {
        dispatchEvent: dispatchEventSpy,
        Termly: { getConsentState: () => ({ essential: true, analytics: false }) },
      } as any;

      const { notifyConsentChanged } = await import("./consent");
      notifyConsentChanged();

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe(COOKIE_CONSENT_CHANGED_EVENT);
      expect(event.detail).toBe("rejected");
    });

    it("does not update memory state if sanitized state is null", async () => {
      const dispatchEventSpy = vi.fn();
      global.window = {
        dispatchEvent: dispatchEventSpy,
        Termly: { getConsentState: () => null },
      } as any;

      const { notifyConsentChanged, readConsentState } = await import("./consent");
      notifyConsentChanged(null);

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(readConsentState()).toBeNull();
    });
  });
});
