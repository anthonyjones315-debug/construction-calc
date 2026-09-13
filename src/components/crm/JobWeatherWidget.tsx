"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudLightning, Snowflake, Wind, MapPin } from "lucide-react";

interface WeatherData {
  address: string;
  temperature: number;
  condition: string;
  windspeed: number;
}

export function JobWeatherWidget({ address = "78701" }: { address?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const res = await fetch(`/api/weather?address=${encodeURIComponent(address)}`);
        if (!res.ok) {
          throw new Error("Failed to load weather data");
        }
        const data = await res.json();
        setWeather(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load weather data");
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [address]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "Clear": return <Sun className="w-8 h-8 text-amber-500" aria-hidden="true" />;
      case "Cloudy": return <Cloud className="w-8 h-8 text-slate-400" aria-hidden="true" />;
      case "Rain": return <CloudRain className="w-8 h-8 text-blue-500" aria-hidden="true" />;
      case "Snow": return <Snowflake className="w-8 h-8 text-sky-300" aria-hidden="true" />;
      case "Storm": return <CloudLightning className="w-8 h-8 text-indigo-500" aria-hidden="true" />;
      default: return <Sun className="w-8 h-8 text-amber-500" aria-hidden="true" />;
    }
  };

  if (loading) {
    return (
      <div
        role="region"
        aria-label="Loading job weather"
        className="animate-pulse bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[100px]"
      >
        <span className="text-sm font-semibold text-slate-400">Loading Job Weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div
        role="region"
        aria-label="Job weather unavailable"
        className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-center min-h-[100px]"
      >
        <span className="text-sm font-semibold text-red-500">Weather Unavailable</span>
      </div>
    );
  }

  const locationName = weather.address.split(",")[0];

  return (
    <div
      role="region"
      aria-label={`Job site weather for ${locationName}: ${weather.temperature} degrees Fahrenheit, ${weather.condition}, wind ${weather.windspeed} miles per hour`}
      className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center justify-between"
    >
      <div>
        <div className="flex items-center gap-1.5 text-[--color-ink-mid] mb-1">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[150px]">
            {locationName}
          </span>
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter">
          {weather.temperature}°F
        </div>
      </div>

      <div className="flex flex-col items-end">
        {getWeatherIcon(weather.condition)}
        <span className="mt-1 text-xs font-bold capitalize text-slate-700">
          {weather.condition}
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mt-1">
          <Wind className="w-3 h-3" aria-hidden="true" /> {weather.windspeed} mph
        </div>
      </div>
    </div>
  );
}
