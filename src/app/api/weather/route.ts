import { NextRequest, NextResponse } from "next/server";
import { WeatherData } from "@/types/event";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    if (!city || !state) {
      return NextResponse.json({ error: "City and state are required" }, { status: 400 });
    }

    // Check if API key is configured
    if (!OPENWEATHER_API_KEY) {
      console.warn("OpenWeather API key not configured");
      return NextResponse.json(
        {
          error: "Weather API not configured",
          message: "Please add OPENWEATHER_API_KEY to your environment variables",
        },
        { status: 503 }
      );
    }

    // Construct location query (city, state, US)
    const locationQuery = `${city},${state},US`;

    // Fetch weather data from OpenWeather API
    const url = `${OPENWEATHER_BASE_URL}?q=${encodeURIComponent(
      locationQuery
    )}&appid=${OPENWEATHER_API_KEY}&units=imperial`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }
      throw new Error(`OpenWeather API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API response to our WeatherData format
    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      conditions: data.weather[0].main.toLowerCase(), // "Clear", "Clouds", "Rain", etc.
      humidity: data.main.humidity,
      feelsLike: Math.round(data.main.feels_like),
      windSpeed: Math.round(data.wind.speed),
      icon: data.weather[0].icon,
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
