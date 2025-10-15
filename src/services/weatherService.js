import axios from "axios";
import redis from "../cache/redisClient.js";

const API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

/**
 * Fetch weather for a given city — using cache first, then Visual Crossing.
 */
export async function getWeatherForCity(city) {
  const cacheKey = `weather:${city.toLowerCase()}`;

  // Try Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("📦 Cache hit for ${city}");
    return { ...JSON.parse(cached), source: "cache" };
  }

  // Fetch from Visual Crossing
  console.log(`🌍 Fetching weather for ${city}...`);
  try {
    const url = `${BASE_URL}/${encodeURIComponent(
      city
    )}?unitGroup=metric&key=${API_KEY}&contentType=json`;
    const { data } = await axios.get(url);

    const result = {
      city: data.address,
      tempC: data.currentConditions?.temp ?? null,
      conditions: data.currentConditions?.conditions ?? "Unknown",
      fetchedAt: new Date().toISOString(),
      source: "visualcrossing",
    };

    // Cache result for 12 hours (43200 s)
    await redis.set(cacheKey, JSON.stringify(result), "EX", 43200);

    return result;
  } catch (error) {
    console.error("Weather API error:", error.message);
    throw new Error("Failed to fetch weather data");
  }
}
