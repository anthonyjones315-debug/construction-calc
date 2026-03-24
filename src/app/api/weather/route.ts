import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const address = searchParams.get("address");

    let lat: number;
    let lng: number;
    let formattedAddress = address || "";

    if (latParam && lngParam) {
      // Direct lat/lng — skip geocoding
      lat = parseFloat(latParam);
      lng = parseFloat(lngParam);
      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: "Invalid lat/lng values" }, { status: 400 });
      }
    } else if (address) {
      // Geocode the address using Google Maps API
      const googleKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!googleKey) {
        return NextResponse.json({ error: "Missing Google Maps API Key" }, { status: 500 });
      }

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
      return NextResponse.json({ error: "Provide address or lat/lng" }, { status: 400 });
    }

    // Fetch Weather using Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`;
    const weatherReq = await fetch(weatherUrl);
    const weatherData = await weatherReq.json();

    if (!weatherData.current_weather) {
      return NextResponse.json({ error: "Weather data unavailable" }, { status: 500 });
    }

    // Map WMO Weather interpretation codes (0-99) to basic strings
    const code = weatherData.current_weather.weathercode;
    let condition = "Clear";
    if (code >= 1 && code <= 3) condition = "Cloudy";
    if (code >= 51 && code <= 67) condition = "Rain";
    if (code >= 71 && code <= 77) condition = "Snow";
    if (code >= 95 && code <= 99) condition = "Storm";

    return NextResponse.json({
      address: formattedAddress,
      temperature: Math.round(weatherData.current_weather.temperature),
      windspeed: weatherData.current_weather.windspeed,
      isDay: weatherData.current_weather.is_day === 1,
      condition,
    });

  } catch (error: unknown) {
    Sentry.captureException(error);
    console.error("[WEATHER_API_ERROR]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Weather error" }, { status: 500 });
  }
}

