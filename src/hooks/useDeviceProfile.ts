"use client";

import { useEffect, useState } from "react";

export type PhoneTier = "small" | "standard" | "large" | null;
export type TabletTier = "standard" | "large" | null;
export type DesktopTier = "laptop" | "tv" | null;
export type LayoutMode =
  | "glass-stack"
  | "tablet-shell"
  | "two-column"
  | "command-center";

export type DeviceProfile = {
  isIPhone15: boolean;
  isIPadPro: boolean;
  isSmartTv: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isDesktopOrTv: boolean;
  phoneTier: PhoneTier;
  tabletTier: TabletTier;
  desktopTier: DesktopTier;
  layoutMode: LayoutMode;
  viewportHeight: number;
  viewportWidth: number;
  shellMaxWidth: number | null;
  shellScaleClass: string;
  blurClass: string;
  bottomBufferClass: string;
  baseTextClass: string;
  highContrastMode: boolean;
};

export type DeviceProfileInput = {
  viewportHeight: number;
  viewportWidth: number;
  userAgent?: string;
};

function createDefaultDeviceProfile(): DeviceProfile {
  return {
    isIPhone15: false,
    isIPadPro: false,
    isSmartTv: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isDesktopOrTv: false,
    phoneTier: null,
    tabletTier: null,
    desktopTier: null,
    layoutMode: "glass-stack",
    viewportHeight: 0,
    viewportWidth: 0,
    shellMaxWidth: null,
    shellScaleClass: "",
    blurClass: "backdrop-glass",
    bottomBufferClass: "",
    baseTextClass: "",
    highContrastMode: false,
  };
}

export function deriveDeviceProfile({
  viewportHeight,
  viewportWidth,
  userAgent = "",
}: DeviceProfileInput): DeviceProfile {
  const normalizedHeight = Math.round(viewportHeight);
  const normalizedWidth = Math.round(viewportWidth);
  const normalizedUserAgent = userAgent.toLowerCase();
  const shortSide = Math.min(normalizedHeight, normalizedWidth);
  const longSide = Math.max(normalizedHeight, normalizedWidth);

  const isIPhone15 =
    /iphone/.test(normalizedUserAgent) &&
    ((shortSide === 390 && longSide === 844) ||
      (shortSide === 393 && longSide === 852));
  const isIPadPro =
    /ipad/.test(normalizedUserAgent) &&
    ((shortSide === 1024 && longSide === 1366) ||
      (shortSide === 834 && longSide === 1194));
  const isSmartTv =
    /smart-tv|smarttv|hbbtv|appletv|googletv|tv/.test(normalizedUserAgent) ||
    longSide >= 2160 ||
    (normalizedWidth >= 2560 && normalizedHeight >= 1440);
  const isMobile = shortSide < 768;
  const isTablet = isIPadPro || (shortSide >= 768 && shortSide < 1024);
  const isDesktop = shortSide >= 1024 && !isSmartTv && !isIPadPro;
  const isDesktopOrTv = isDesktop || isSmartTv;

  let phoneTier: PhoneTier = null;
  let tabletTier: TabletTier = null;
  let desktopTier: DesktopTier = null;
  let layoutMode: LayoutMode = "glass-stack";
  let shellMaxWidth: number | null = null;
  let shellScaleClass = "";
  let blurClass = "backdrop-glass";
  let bottomBufferClass = "";
  let baseTextClass = "";
  let highContrastMode = false;

  if (isMobile) {
    phoneTier =
      shortSide <= 375 || longSide <= 812
        ? "small"
        : isIPhone15 || longSide <= 844
          ? "standard"
          : "large";
    layoutMode = "glass-stack";
    shellScaleClass =
      phoneTier === "small"
        ? "hardware-scale-90"
        : phoneTier === "large"
          ? "hardware-scale-105"
          : "";
    blurClass = phoneTier === "small" ? "hardware-blur-8" : "backdrop-glass";
    bottomBufferClass = phoneTier === "large" ? "hardware-bottom-buffer" : "";
  } else if (isTablet) {
    tabletTier = isIPadPro ? "large" : "standard";
    layoutMode = "tablet-shell";
    shellMaxWidth = tabletTier === "large" ? 880 : 720;
  } else if (isSmartTv) {
    desktopTier = "tv";
    layoutMode = "command-center";
    baseTextClass = "hardware-text-tv";
    highContrastMode = true;
  } else {
    desktopTier = "laptop";
    layoutMode = "two-column";
  }

  return {
    isIPhone15,
    isIPadPro,
    isSmartTv,
    isMobile,
    isTablet,
    isDesktop,
    isDesktopOrTv,
    phoneTier,
    tabletTier,
    desktopTier,
    layoutMode,
    viewportHeight: normalizedHeight,
    viewportWidth: normalizedWidth,
    shellMaxWidth,
    shellScaleClass,
    blurClass,
    bottomBufferClass,
    baseTextClass,
    highContrastMode,
  };
}

function readProfile(): DeviceProfile {
  if (typeof window === "undefined") {
    return createDefaultDeviceProfile();
  }

  return deriveDeviceProfile({
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
    userAgent: window.navigator.userAgent,
  });
}

export function useDeviceProfile() {
  const [profile, setProfile] = useState<DeviceProfile>(() => readProfile());

  useEffect(() => {
    const syncProfile = () => {
      const next = readProfile();
      setProfile(next);

      document.documentElement.dataset.deviceProfile = next.isIPhone15
        ? "iphone-15"
        : next.phoneTier
          ? `phone-${next.phoneTier}`
          : next.tabletTier
            ? `tablet-${next.tabletTier}`
            : next.isSmartTv
              ? "smart-tv"
              : "desktop";
      document.documentElement.dataset.layoutMode = next.layoutMode;
      document.documentElement.dataset.highContrast = next.highContrastMode
        ? "true"
        : "false";
    };

    syncProfile();
    window.addEventListener("resize", syncProfile);
    window.addEventListener("orientationchange", syncProfile);
    return () => {
      window.removeEventListener("resize", syncProfile);
      window.removeEventListener("orientationchange", syncProfile);
    };
  }, []);

  return profile;
}
