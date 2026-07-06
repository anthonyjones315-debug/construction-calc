import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { getClientIp } from "@/lib/http/client-ip";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";

const querySchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  address: z.string().max(500).optional(),
  zip: z.string().max(20).optional(),
});

async function geocodeZip(zip: string, googleKey: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)},US&key=${googleKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !data.results?.[0]) return null;
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat as number, lng: loc.lng as number, name: data.results[0].formatted_address as string };
}

function wmoToCondition(code: number) {
  if (code >= 95) return "Storm";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 1 && code <= 3) return "Cloudy";
  return "Clear";
}

export async function GET(req: NextRequest) {
  try {
    // 1. Rate Limiting (IP-based) - check before auth to protect against DDoS/abuse
    const ip = getClientIp(req);
    const rl = checkMemoryRateLimit("weather-api", ip, 10, 60_000); // 10 requests per minute
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSeconds) },
        },
      );
    }

    // 2. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // 3. Input Validation
    const result = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!result.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { lat: latParam, lng: lngParam, address, zip } = result.data;

    let lat: number;
    let lng: number;
    let formattedAddress = address || "";
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;

    if (latParam !== undefined && lngParam !== undefined) {
      lat = latParam;
      lng = lngParam;
    } else if (zip && googleKey) {
      const geo = await geocodeZip(zip, googleKey);
      if (!geo) return NextResponse.json({ error: "Failed to geocode zip" }, { status: 400 });
      lat = geo.lat;
      lng = geo.lng;
      formattedAddress = geo.name;
    } else if (address && googleKey) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleKey}`;
      const geocodeReq = await fetch(geocodeUrl);
      const geocodeData = await geocodeReq.json();
      if (geocodeData.status !== "OK" || !geocodeData.results?.[0]) {
        return NextResponse.json({ error: "Failed to geocode address via Google Maps." }, { status: 400 });
      }
      const location = geocodeData.results[0].geometry.location;
      lat = location.lat;
      lng = location.lng;
      formattedAddress = geocodeData.results[0].formatted_address;
    } else {
      return NextResponse.json({ error: "Provide address, zip, or lat/lng" }, { status: 400 });
    }

    // Fetch current + daily forecast from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
    const weatherReq = await fetch(weatherUrl, { next: { revalidate: 1800 } });
    const weatherData = await weatherReq.json();

    if (!weatherData.current_weather) {
      return NextResponse.json({ error: "Weather data unavailable" }, { status: 500 });
    }

    const code = weatherData.current_weather.weathercode;

    // Build daily forecast array
    const forecast: { date: string; temp_high: number; temp_low: number; description: string; icon: string }[] = [];
    if (weatherData.daily?.time) {
      const times: string[] = weatherData.daily.time;
      const maxTemps: number[] = weatherData.daily.temperature_2m_max;
      const minTemps: number[] = weatherData.daily.temperature_2m_min;
      const codes: number[] = weatherData.daily.weathercode;
      for (let i = 0; i < Math.min(3, times.length); i++) {
        const d = new Date(times[i]);
        const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const cond = wmoToCondition(codes[i]);
        forecast.push({
          date: label,
          temp_high: Math.round(maxTemps[i]),
          temp_low: Math.round(minTemps[i]),
          description: cond.toLowerCase(),
          icon: cond.toLowerCase(),
        });
      }
    }

    return NextResponse.json({
      address: formattedAddress,
      location: formattedAddress,
      temperature: Math.round(weatherData.current_weather.temperature),
      windspeed: weatherData.current_weather.windspeed,
      isDay: weatherData.current_weather.is_day === 1,
      condition: wmoToCondition(code),
      forecast,
    });

  } catch (error: unknown) {
    Sentry.captureException(error);
    console.error("[WEATHER_API_ERROR]", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
