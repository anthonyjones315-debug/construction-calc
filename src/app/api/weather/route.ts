import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const address = searchParams.get("address");
    const zip = searchParams.get("zip");

    let lat: number;
    let lng: number;
    let formattedAddress = address || "";
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;

    if (latParam && lngParam) {
      lat = parseFloat(latParam);
      lng = parseFloat(lngParam);
      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: "Invalid lat/lng values" }, { status: 400 });
      }
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Weather error" }, { status: 500 });
  }
}

