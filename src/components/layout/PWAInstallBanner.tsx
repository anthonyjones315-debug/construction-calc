"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_dismissed";

function getDismissedFlag(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function setDismissedFlag(): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Ignore storage write failures (private mode / blocked storage)
  }
}

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
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
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
    let mediaQueryHandler: (() => void) | null = null;
    let frame: number | null = null;
    let mql: MediaQueryList | null = null;

    const run = () => {
      const standaloneNow = isStandaloneMode();
      setIsStandalone(standaloneNow);

      // If the app is already running as an installed PWA, never show the banner again
      // on this device unless localStorage is cleared.
      if (standaloneNow) {
        setDismissedFlag();
        setVisible(false);
        return;
      }

      if (getDismissedFlag()) return;
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
        mediaQueryHandler = () => {
          const nowStandalone =
            mql?.matches ||
            (("standalone" in window.navigator &&
              (window.navigator as Navigator & { standalone?: boolean })
                .standalone) ??
              false);
          setIsStandalone(Boolean(nowStandalone));
          if (nowStandalone) {
            setDismissedFlag();
            setVisible(false);
          }
        };
        if (typeof mql.addEventListener === "function") {
          mql.addEventListener("change", mediaQueryHandler);
        } else {
          mql.addListener(mediaQueryHandler);
        }
      }

      const appInstalledHandler = () => {
        setDismissedFlag();
        setVisible(false);
        setDeferredPrompt(null);
      };

      window.addEventListener("appinstalled", appInstalledHandler);

      return () => {
        window.removeEventListener("appinstalled", appInstalledHandler);
      };
    };

    const cleanup = run();

    return () => {
      if (typeof cleanup === "function") cleanup();
      if (typeof frame === "number") cancelAnimationFrame(frame);
      if (handler) window.removeEventListener("beforeinstallprompt", handler);
      if (mql && mediaQueryHandler) {
        try {
          if (typeof mql.removeEventListener === "function") {
            mql.removeEventListener("change", mediaQueryHandler);
          } else {
            mql.removeListener(mediaQueryHandler);
          }
        } catch {
          // Older Safari may not support removeEventListener on MediaQueryList; ignore.
        }
      }
    };
  }, []);

  function dismiss() {
    setDismissedFlag();
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
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] z-40 px-3 sm:bottom-auto sm:top-[calc(env(safe-area-inset-top,0px)+2.5rem)] sm:px-4 md:top-[calc(env(safe-area-inset-top,0px)+3rem)]"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-orange-700/60 bg-orange-600 px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.4)] sm:max-w-7xl sm:rounded-2xl">
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
                <strong className="font-black">
                  &ldquo;Add to Home Screen&rdquo;
                </strong>{" "}
                to use this as an app.
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
              <span className="min-w-0 text-left sm:truncate">
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
