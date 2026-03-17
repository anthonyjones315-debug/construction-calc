"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  notifyConsentChanged,
  readConsentState,
  type TermlyConsentState,
} from "@/lib/privacy/consent";

const SCRIPT_SRC_BASE = "https://app.termly.io";

declare global {
  interface Window {
    Termly?: {
      initialize?: () => void;
      on?: (
        event: "initialized" | "consent",
        callback: (data?: unknown) => void,
      ) => void;
      getConsentState?: () => TermlyConsentState | null | undefined;
    };
  }
}

type TermlyCMPProps = {
  websiteUUID: string;
  autoBlock?: boolean;
  masterConsentsOrigin?: string;
};

/**
 * Lightweight loader for Termly CMP. Injects the resource blocker script once
 * and re-initializes on client-side route changes.
 */
export default function TermlyCMP({
  autoBlock,
  masterConsentsOrigin,
  websiteUUID,
}: TermlyCMPProps) {
  const scriptSrc = useMemo(() => {
    if (!websiteUUID) return null;
    const src = new URL(SCRIPT_SRC_BASE);
    src.pathname = `/resource-blocker/${websiteUUID}`;
    if (autoBlock) {
      src.searchParams.set("autoBlock", "on");
    }
    if (masterConsentsOrigin) {
      src.searchParams.set("masterConsentsOrigin", masterConsentsOrigin);
    }
    return src.toString();
  }, [autoBlock, masterConsentsOrigin, websiteUUID]);

  const isScriptAdded = useRef(false);

  useEffect(() => {
    if (!scriptSrc || isScriptAdded.current) return;

    // If Termly's resource-blocker script is already present (e.g. injected
    // via their embed snippet in the HTML), do not inject a second copy.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://app.termly.io/resource-blocker/"]',
    );
    if (existing) {
      isScriptAdded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    document.head.appendChild(script);
    isScriptAdded.current = true;

    // Do not remove the script on unmount; Termly expects it to remain
    // singleton on the page across client navigations.
    return () => {
      isScriptAdded.current = false;
    };
  }, [scriptSrc]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.Termly?.on) return;

    const syncConsent = () => {
      notifyConsentChanged(readConsentState());
    };

    window.Termly.on("initialized", syncConsent);
    window.Termly.on("consent", syncConsent);
    syncConsent();
  }, [scriptSrc]);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Re-run initialization after client-side route changes.
    window.Termly?.initialize?.();
  }, [pathname, searchParams]);

  return null;
}
