import { Router } from "express";
import {
  getWeatherForCity,
  getForecastForLocation,
} from "../services/weatherService.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "weather-api" });
});

router.get("/weather", async (req, res) => {
  const { city } = req.query;
  if (!city) {
    const err = new Error("City parameter is required");
    err.status(400);
    throw err;
  }
  try {
    const weather = await getWeatherForCity(city);
    res.json(weather);
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch weather data" });
  }
});

router.get("/forecast", async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: "Location parameter is required" });
  }
  try {
    const forecast = await getForecastForLocation(location);
    res.json(forecast);
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch forecast data" });
  }
});

export default router;
