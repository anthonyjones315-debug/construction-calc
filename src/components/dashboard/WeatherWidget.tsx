"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Snowflake, CloudLightning, Wind } from "lucide-react";

type ForecastDay = {
  date: string;
  temp_high: number;
  temp_low: number;
  description: string;
  icon: string;
};

type WeatherData = {
  location: string;
  forecast: ForecastDay[];
};

function WeatherIcon({ icon }: { icon: string }) {
  const cls = "h-6 w-6";
  if (icon.includes("rain") || icon.includes("drizzle"))
    return <CloudRain className={`${cls} text-blue-500`} aria-hidden="true" />;
  if (icon.includes("snow")) return <Snowflake className={`${cls} text-cyan-400`} aria-hidden="true" />;
  if (icon.includes("thunder"))
    return <CloudLightning className={`${cls} text-amber-500`} aria-hidden="true" />;
  if (icon.includes("clear") || icon.includes("sun"))
    return <Sun className={`${cls} text-amber-400`} aria-hidden="true" />;
  if (icon.includes("wind")) return <Wind className={`${cls} text-slate-400`} aria-hidden="true" />;
  return <Cloud className={`${cls} text-slate-400`} aria-hidden="true" />;
}

export function WeatherWidget({ zip }: { zip?: string | null }) {
  const hasValidZip = !!zip && zip.trim().length >= 5;
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(hasValidZip);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasValidZip) return;
    let cancelled = false;

    fetch(`/api/weather?zip=${encodeURIComponent(zip!.trim())}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data: WeatherData) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load weather");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [zip, hasValidZip]);

  if (!zip) return null;
  if (loading) {
    return (
      <div
        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
        role="status"
        aria-label="Loading 3-day weather forecast"
      >
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-3 flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 flex-1 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs text-red-500"
        role="alert"
      >
        {error}
      </div>
    );
  }
  if (!weather) return null;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label={`3-Day Forecast for ${weather.location}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        3-Day Forecast – {weather.location}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {weather.forecast.slice(0, 3).map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center rounded-xl bg-slate-50 px-2 py-3"
          >
            <WeatherIcon icon={day.description.toLowerCase()} />
            <p className="mt-1.5 text-[10px] font-semibold text-slate-600">
              {day.date}
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-800">
              {day.temp_high}°
              <span className="ml-1 font-normal text-slate-400">
                {day.temp_low}°
              </span>
            </p>
            <p className="mt-0.5 text-[9px] capitalize text-slate-400">
              {day.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
