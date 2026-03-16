"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_dismissed";

function isIOSDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(
    navigator.userAgent,
  );
}

function isStandaloneMode(): boolean {
  // Covers Chrome/Android standalone and iOS "Add to Home Screen"
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (
      "standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    let handler: ((e: Event) => void) | null = null;
    let frame: number | null = null;
    let mql: MediaQueryList | null = null;

    const run = () => {
      const standaloneNow = isStandaloneMode();
      setIsStandalone(standaloneNow);

      // If the app is already running as an installed PWA, never show the banner again
      // on this device unless localStorage is cleared.
      if (standaloneNow) {
        localStorage.setItem(DISMISSED_KEY, "1");
        setVisible(false);
        return;
      }

      if (localStorage.getItem(DISMISSED_KEY)) return;
      if (!isMobile()) return;

      const ios = isIOSDevice();
      frame = requestAnimationFrame(() => {
        setIsIOS(ios);
        if (ios) {
          setVisible(true);
          return;
        }

        handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
      });

      // Keep banner state in sync if the user installs the app while the page is open.
      if ("matchMedia" in window) {
        mql = window.matchMedia("(display-mode: standalone)");
        const handleChange = () => {
          const nowStandalone =
            mql?.matches ||
            (("standalone" in window.navigator &&
              (window.navigator as Navigator & { standalone?: boolean }).standalone) ??
              false);
          setIsStandalone(Boolean(nowStandalone));
          if (nowStandalone) {
            localStorage.setItem(DISMISSED_KEY, "1");
            setVisible(false);
          }
        };
        mql.addEventListener("change", handleChange);
      }
    };

    run();

    return () => {
      if (typeof frame === "number") cancelAnimationFrame(frame);
      if (handler) window.removeEventListener("beforeinstallprompt", handler);
      if (mql) {
        try {
          mql.removeEventListener("change", () => {});
        } catch {
          // Older Safari may not support removeEventListener on MediaQueryList; ignore.
        }
      }
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible || isStandalone) return null;

  return (
    <div
      role="banner"
      aria-label="Install Pro Construction Calc"
      className="fixed inset-x-0 z-40 border-b border-orange-700/60 bg-orange-600 shadow-[0_4px_16px_rgba(0,0,0,0.4)] top-[env(safe-area-inset-top,0px)] sm:top-10 md:top-12"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
        {isIOS ? (
          <>
            <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden>👷</span>
              <span className="min-w-0">
                Tap{" "}
                <strong className="font-black">
                  Share{" "}
                  <span aria-label="Share icon" role="img">
                    ⬆
                  </span>
                </strong>{" "}
                then{" "}
                <strong className="font-black">&ldquo;Add to Home Screen&rdquo;</strong>
                {" "}to use this as an app.
              </span>
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install tip"
              className="shrink-0 rounded-lg border border-white/25 px-2 py-1 text-xs text-white/80 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden>👷</span>
              <span className="truncate">
                Add Pro Construction Calc to your home screen for instant field
                use.
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={install}
                className="rounded-lg border border-white/30 bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss install banner"
                className="rounded-lg border border-white/25 px-2 py-1 text-xs text-white/80 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
