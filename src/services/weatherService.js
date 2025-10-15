import axios from "axios";
import redis from "../cache/redisClient.js";
import { config } from "../config/index.js";

const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export async function getWeatherForCity(city) {
  const cacheKey = `weather:${city.toLowerCase()}`;
  const { API_KEY } = config;

  // Try Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`📦 Cache hit for ${city}`);
    return { ...JSON.parse(cached), source: "cache" };
  }

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

    // Cache result for 12 hours
    await redis.set(cacheKey, JSON.stringify(result), "EX", 43200);

    return result;
  } catch (error) {
    console.error("Weather API error:", error.message);
    throw new Error("Failed to fetch weather data");
  }
}
