"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const PRO_MODE_STORAGE_KEY = "constructionCalc.proMode";
const PRO_MODE_EVENT = "construction-calc:pro-mode-changed";

export function useProMode() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [proMode, setProModeState] = useState(false);
  const isAuthenticated = Boolean(session?.user);
  const authKey = session?.user?.id ?? session?.user?.email ?? "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status === "loading") return;

    const saved = window.localStorage.getItem(PRO_MODE_STORAGE_KEY);

    if (!isAuthenticated) {
      setProModeState(saved === "true");
      setMounted(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/user-preferences", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;

        const remoteValue =
          typeof payload?.preferences?.proModeEnabled === "boolean"
            ? payload.preferences.proModeEnabled
            : null;

        if (remoteValue === null && saved !== null) {
          const localValue = saved === "true";
          setProModeState(localValue);
          void fetch("/api/user-preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proModeEnabled: localValue }),
          });
        } else {
          setProModeState(remoteValue === true);
          window.localStorage.setItem(
            PRO_MODE_STORAGE_KEY,
            String(remoteValue === true),
          );
        }
      } catch {
        if (cancelled) return;
        setProModeState(saved === "true");
      } finally {
        if (!cancelled) {
          setMounted(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authKey, isAuthenticated, status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PRO_MODE_STORAGE_KEY) return;
      setProModeState(event.newValue === "true");
    };
    const handleInTabUpdate = () => {
      const saved = window.localStorage.getItem(PRO_MODE_STORAGE_KEY);
      setProModeState(saved === "true");
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(PRO_MODE_EVENT, handleInTabUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PRO_MODE_EVENT, handleInTabUpdate);
    };
  }, []);

  const setProMode = useCallback(
    async (next: boolean) => {
      setProModeState(next);
      if (typeof window === "undefined") return;
      window.localStorage.setItem(PRO_MODE_STORAGE_KEY, String(next));
      window.dispatchEvent(new CustomEvent(PRO_MODE_EVENT));
      if (!isAuthenticated) return;

      try {
        await fetch("/api/user-preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proModeEnabled: next }),
        });
      } catch {
        // Keep the optimistic client preference even if the server write fails.
      }
    },
    [isAuthenticated],
  );

  return { proMode, setProMode, mounted };
}
