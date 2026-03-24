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
      case "Clear": return <Sun className="w-8 h-8 text-amber-500" />;
      case "Cloudy": return <Cloud className="w-8 h-8 text-slate-400" />;
      case "Rain": return <CloudRain className="w-8 h-8 text-blue-500" />;
      case "Snow": return <Snowflake className="w-8 h-8 text-sky-300" />;
      case "Storm": return <CloudLightning className="w-8 h-8 text-indigo-500" />;
      default: return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[100px]">
        <span className="text-sm font-semibold text-slate-400">Loading Job Weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-center min-h-[100px]">
        <span className="text-sm font-semibold text-red-500">Weather Unavailable</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-1.5 text-[--color-ink-mid] mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[150px]">
            {weather.address.split(",")[0]}
          </span>
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter">
          {weather.temperature}°F
        </div>
      </div>

      <div className="flex flex-col items-end">
        {getWeatherIcon(weather.condition)}
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mt-2">
          <Wind className="w-3 h-3" /> {weather.windspeed} mph
        </div>
      </div>
    </div>
  );
}
