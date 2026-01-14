import { WeatherData } from "@/types/event";

/**
 * Fetch weather data for a location
 */
export async function fetchWeather(city: string, state: string): Promise<WeatherData> {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch weather");
  }

  return response.json();
}

/**
 * Get a user-friendly description of weather conditions
 */
export function getWeatherDescription(conditions: string, temperature: number): string {
  const temp = Math.round(temperature);
  const conditionLower = conditions.toLowerCase();

  if (conditionLower.includes("clear") || conditionLower.includes("sun")) {
    if (temp >= 80) return "Hot and sunny";
    if (temp >= 65) return "Sunny and pleasant";
    return "Clear and cool";
  }

  if (conditionLower.includes("cloud")) {
    if (temp >= 75) return "Warm and cloudy";
    if (temp >= 60) return "Mild and overcast";
    return "Cool and cloudy";
  }

  if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
    if (temp >= 65) return "Rainy and warm";
    return "Rainy and cool";
  }

  if (conditionLower.includes("storm") || conditionLower.includes("thunder")) {
    return "Stormy weather";
  }

  if (conditionLower.includes("snow")) {
    return "Snowy conditions";
  }

  if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
    return "Foggy conditions";
  }

  // Default fallback
  if (temp >= 80) return "Hot weather";
  if (temp >= 65) return "Pleasant weather";
  if (temp >= 45) return "Cool weather";
  return "Cold weather";
}

/**
 * Get clothing recommendations based on temperature
 */
export function getTemperatureGuidance(temperature: number): string[] {
  const temp = Math.round(temperature);
  const guidance: string[] = [];

  if (temp >= 85) {
    guidance.push("Breathable, lightweight fabrics recommended");
    guidance.push("Consider sleeveless or short sleeves");
    guidance.push("Avoid heavy materials");
  } else if (temp >= 75) {
    guidance.push("Light fabrics work well");
    guidance.push("Short or 3/4 sleeves recommended");
  } else if (temp >= 65) {
    guidance.push("Moderate layers recommended");
    guidance.push("Consider bringing a light jacket or cardigan");
  } else if (temp >= 50) {
    guidance.push("Layering recommended");
    guidance.push("Bring a jacket or blazer");
    guidance.push("Consider closed-toe shoes");
  } else if (temp >= 40) {
    guidance.push("Warm layers essential");
    guidance.push("Heavy coat or jacket recommended");
    guidance.push("Consider tights or pants");
  } else {
    guidance.push("Heavy winter layers required");
    guidance.push("Thick coat essential");
    guidance.push("Closed-toe shoes and warm tights");
  }

  return guidance;
}

/**
 * Determine if conditions require rain protection
 */
export function needsRainProtection(conditions: string): boolean {
  const conditionLower = conditions.toLowerCase();
  return (
    conditionLower.includes("rain") ||
    conditionLower.includes("drizzle") ||
    conditionLower.includes("storm") ||
    conditionLower.includes("thunder")
  );
}

/**
 * Get outfit style suggestions based on weather
 */
export function getStyleSuggestions(weatherData: WeatherData): string[] {
  const suggestions: string[] = [];
  const { temperature, conditions, humidity } = weatherData;

  // Temperature-based suggestions
  if (temperature >= 80) {
    suggestions.push("Flowy, breathable dresses work well");
    suggestions.push("Open-toe shoes recommended");
  } else if (temperature >= 65) {
    suggestions.push("Midi or knee-length dresses ideal");
    suggestions.push("Light layering pieces available");
  } else {
    suggestions.push("Long dresses or pants recommended");
    suggestions.push("Closed-toe shoes for warmth");
  }

  // Condition-based suggestions
  if (needsRainProtection(conditions)) {
    suggestions.push("Consider waterproof shoes or boots");
    suggestions.push("Avoid delicate fabrics");
  }

  // Humidity-based suggestions
  if (humidity > 70) {
    suggestions.push("Avoid heavy fabrics due to humidity");
    suggestions.push("Natural fibers breathe better");
  }

  return suggestions;
}
