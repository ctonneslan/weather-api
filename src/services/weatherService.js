import axios from "axios";
import redis from "../cache/redisClient.js";
import { config } from "../config/index.js";

const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export async function getWeatherForCity(city) {
  const cacheKey = `weather:${city.toLowerCase()}`;
  const { weatherApiKey } = config;

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
    )}?unitGroup=metric&key=${weatherApiKey}&contentType=json`;

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

export async function getForecastForLocation(location) {
  const cacheKey = `forecast:${location.toLowerCase()}`;
  const { weatherApiKey } = config;

  // Try Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`📦 Cache hit for forecast: ${location}`);
    return { ...JSON.parse(cached), source: "cache" };
  }

  console.log(`🌍 Fetching 7-day forecast for ${location}...`);
  try {
    const url = `${BASE_URL}/${encodeURIComponent(
      location
    )}?unitGroup=metric&key=${weatherApiKey}&contentType=json&include=days`;

    const { data } = await axios.get(url);

    const forecast = data.days.slice(0, 7).map((day) => ({
      date: day.datetime,
      tempMax: day.tempmax,
      tempMin: day.tempmin,
      conditions: day.conditions,
      description: day.description,
      icon: day.icon,
      precipProb: day.precipprob,
      humidity: day.humidity,
      windSpeed: day.windspeed,
    }));

    const result = {
      location: data.resolvedAddress,
      latitude: data.latitude,
      longitude: data.longitude,
      forecast,
      current: data.currentConditions
        ? {
            temp: data.currentConditions.temp,
            conditions: data.currentConditions.conditions,
            feelsLike: data.currentConditions.feelslike,
            humidity: data.currentConditions.humidity,
            windSpeed: data.currentConditions.windspeed,
          }
        : null,
      fetchedAt: new Date().toISOString(),
      source: "visualcrossing",
    };

    // Cache result for 6 hours (forecasts change less frequently)
    await redis.set(cacheKey, JSON.stringify(result), "EX", 21600);

    return result;
  } catch (error) {
    console.error("Forecast API error:", error.message);
    throw new Error("Failed to fetch forecast data");
  }
}
