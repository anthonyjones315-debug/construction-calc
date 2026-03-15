/**
 * Browser-safe wrapper around the Vibration API.
 * Returns a `haptic(ms)` function that fires navigator.vibrate
 * only when the API is available (most Android devices; no-ops on iOS and desktop).
 */
export function useHaptic() {
  function haptic(duration = 10) {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    ) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Silently swallow — API exists but call was blocked (e.g. iframe, permission denied)
      }
    }
  }

  return haptic;
}
