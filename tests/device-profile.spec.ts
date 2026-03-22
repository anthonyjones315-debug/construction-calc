import { describe, expect, it } from "vitest";
import { deriveDeviceProfile } from "@/hooks/useDeviceProfile";

describe("deriveDeviceProfile", () => {
  it("treats iPhone 15 as the standard phone baseline", () => {
    const profile = deriveDeviceProfile({
      viewportWidth: 390,
      viewportHeight: 844,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    });

    expect(profile.isIPhone15).toBe(true);
    expect(profile.phoneTier).toBe("standard");
    expect(profile.layoutMode).toBe("glass-stack");
    expect(profile.shellScaleClass).toBe("");
    expect(profile.bottomBufferClass).toBe("");
  });

  it("scales small phones down for compact layouts", () => {
    const profile = deriveDeviceProfile({
      viewportWidth: 375,
      viewportHeight: 667,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    });

    expect(profile.phoneTier).toBe("small");
    expect(profile.shellScaleClass).toBe("hardware-scale-90");
    expect(profile.blurClass).toBe("");
  });

  it("keeps landscape phones in the mobile profile", () => {
    const profile = deriveDeviceProfile({
      viewportWidth: 844,
      viewportHeight: 390,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    });

    expect(profile.isMobile).toBe(true);
    expect(profile.isTablet).toBe(false);
    expect(profile.isDesktop).toBe(false);
    expect(profile.phoneTier).toBe("standard");
    expect(profile.layoutMode).toBe("glass-stack");
  });

  it("expands large tablets into the wide shell layout", () => {
    const profile = deriveDeviceProfile({
      viewportWidth: 1024,
      viewportHeight: 1366,
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    });

    expect(profile.isIPadPro).toBe(true);
    expect(profile.tabletTier).toBe("large");
    expect(profile.layoutMode).toBe("tablet-shell");
    expect(profile.shellMaxWidth).toBe(880);
  });

  it("switches TVs into command-center mode with high contrast", () => {
    const profile = deriveDeviceProfile({
      viewportWidth: 3840,
      viewportHeight: 2160,
      userAgent: "Mozilla/5.0 (SMART-TV; Linux; Tizen 8.0)",
    });

    expect(profile.isSmartTv).toBe(true);
    expect(profile.desktopTier).toBe("tv");
    expect(profile.layoutMode).toBe("command-center");
    expect(profile.baseTextClass).toBe("hardware-text-tv");
    expect(profile.highContrastMode).toBe(true);
  });
});
