import { Router } from "express";
import { getWeatherForCity } from "../services/weatherService.js";

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

export default router;
