"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ──────────────────────────────────────────────────────────────────────
 * PlaceAutocomplete — React wrapper for the NEW
 * google.maps.places.PlaceAutocompleteElement (Web Component).
 *
 * Replaces the deprecated google.maps.places.Autocomplete class used by
 * react-google-autocomplete.
 * ────────────────────────────────────────────────────────────────────── */

interface PlaceAutocompleteProps {
  apiKey?: string;
  /** Called when a place is selected from the dropdown. */
  onPlaceSelect: (address: string, lat?: number, lng?: number) => void;
  /** Called when the user types in the fallback input (before API loads). */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

// Module-level singleton so we only load the script once across all instances.
let loadPromise: Promise<void> | null = null;
let loaded = false;

function ensureMapsScript(apiKey: string): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // If the script is already on the page (e.g. another component loaded it)
    if (typeof google !== "undefined" && typeof google.maps?.importLibrary === "function") {
      loaded = true;
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    if (existing) {
      // Script tag exists but may not have finished loading
      existing.addEventListener("load", () => {
        loaded = true;
        resolve();
      });
      existing.addEventListener("error", reject);
      // If the script already loaded, google should be defined
      if (typeof google !== "undefined" && typeof google.maps?.importLibrary === "function") {
        loaded = true;
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      loaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function PlaceAutocomplete({
  apiKey,
  onPlaceSelect,
  onChange,
  placeholder = "Start typing an address...",
  defaultValue = "",
  className,
}: PlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const [fallbackValue, setFallbackValue] = useState(defaultValue);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  onPlaceSelectRef.current = onPlaceSelect;

  const initElement = useCallback(async () => {
    if (!apiKey || !containerRef.current) return;

    try {
      await ensureMapsScript(apiKey);

      // Import the places library to ensure PlaceAutocompleteElement is available
      await google.maps.importLibrary("places");

      if (!containerRef.current || elementRef.current) return;

      const el = new google.maps.places.PlaceAutocompleteElement({
        types: ["address"],
      });

      el.placeholder = placeholder;

      // Listen for selects
      el.addEventListener("gmp-select", async (event: Event) => {
        const selectEvent = event as google.maps.places.PlaceAutocompletePlaceSelectEvent;
        const placePrediction = selectEvent.placePrediction;
        if (!placePrediction) return;

        try {
          const place = placePrediction.toPlace();
          await place.fetchFields({
            fields: ["formattedAddress", "location", "displayName"],
          });

          const address =
            place.formattedAddress || place.displayName || "";
          const lat = place.location?.lat();
          const lng = place.location?.lng();

          onPlaceSelectRef.current(address, lat, lng);
        } catch {
          // If fetchFields fails, try to use whatever text is available
          const text = placePrediction.text?.toString() ?? "";
          if (text) onPlaceSelectRef.current(text);
        }
      });

      containerRef.current.appendChild(el as unknown as Node);
      elementRef.current = el;
      setReady(true);
    } catch (err) {
      console.warn("[PlaceAutocomplete] Failed to initialize:", err);
    }
  }, [apiKey, placeholder]);

  useEffect(() => {
    initElement();
    return () => {
      // Cleanup: remove the web component from DOM
      if (elementRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(
            elementRef.current as unknown as Node,
          );
        } catch {
          // Already removed
        }
      }
      elementRef.current = null;
    };
  }, [initElement]);

  const defaultClassName =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-blue-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-blue-brand]/20";

  return (
    <>
      {/* Container for the Web Component */}
      <div
        ref={containerRef}
        className={ready ? (className || "") : "hidden"}
        style={
          ready
            ? {
                // The gmp-place-autocomplete element has its own internal input.
                // We style the container so it integrates with our design.
              }
            : undefined
        }
      />

      {/* Fallback: plain input shown while the API loads */}
      {!ready && (
        <input
          type="text"
          placeholder={placeholder}
          value={fallbackValue}
          onChange={(e) => {
            setFallbackValue(e.target.value);
            onChange?.(e);
          }}
          className={className || defaultClassName}
        />
      )}
    </>
  );
}
