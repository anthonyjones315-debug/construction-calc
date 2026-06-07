"use client";

import { useState, useCallback } from "react";

export type GeolocationResult = {
  address: string;
  latitude: number;
  longitude: number;
};

export function useGeolocation() {
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(async (onResult: (result: GeolocationResult) => void) => {
    if (!("geolocation" in navigator)) {
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          if (data && data.display_name) {
            onResult({
              address: data.display_name,
              latitude,
              longitude,
            });
          } else {
            // Fallback to just coordinates if address not found
            onResult({
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              latitude,
              longitude,
            });
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          // Fallback to coordinates
          onResult({
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude,
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation failed", error);
        setLoading(false);
      },
    );
  }, []);

  return { getPosition, loading };
}
