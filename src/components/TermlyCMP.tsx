"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SCRIPT_SRC_BASE = "https://app.termly.io";

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
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    document.head.appendChild(script);
    isScriptAdded.current = true;
    return () => {
      document.head.removeChild(script);
      isScriptAdded.current = false;
    };
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
