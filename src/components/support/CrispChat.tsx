"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export function CrispChat() {
  const pathname = usePathname();

  const isSignedEstimateRoute =
    pathname?.startsWith("/estimate/sign/") || pathname?.startsWith("/sign/");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isSignedEstimateRoute) return;

    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) return;

    // Standard Crisp snippet adapted for React/Next.js
    if (window.$crisp && window.CRISP_WEBSITE_ID === websiteId) {
      return;
    }

    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = websiteId;

    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    document.body.appendChild(script);

    return () => {
      // Keep Crisp loaded across route transitions; do not remove script here.
    };
  }, [isSignedEstimateRoute]);

  return null;
}
