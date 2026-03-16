/**
 * Browser-safe wrapper around the Vibration API.
 * Returns a `haptic(ms)` function that fires navigator.vibrate
 * only when the API is available (most Android devices; no-ops on iOS and desktop).
 */
export function triggerHaptic(pattern: number | number[] = [10]) {
  if (
    typeof window !== "undefined" &&
    typeof window.navigator?.vibrate === "function"
  ) {
    try {
      window.navigator.vibrate(pattern);
    } catch {
      // Silently swallow — API exists but call was blocked (e.g. iframe, permission denied)
    }
  }
}

export function useHaptic() {
  function haptic(duration = 10) {
    triggerHaptic([duration]);
  }

  return haptic;
}
