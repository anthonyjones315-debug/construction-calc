import { useState } from "react";

export interface GeolocationResult {
  address: string;
  latitude: number;
  longitude: number;
}

export function useGeolocation(onResult: (result: GeolocationResult) => void) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUseLocation = () => {
    if (!("geolocation" in navigator)) return;

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.display_name) {
            onResult({
              address: data.display_name,
              latitude,
              longitude,
            });
          }
        } catch (error) {
          console.error("Error fetching address:", error);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoading(false);
      }
    );
  };

  return { isLoading, handleUseLocation };
}
