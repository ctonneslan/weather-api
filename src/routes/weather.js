import { Router } from "express";
import { getWeatherForCity } from "../services/weatherService.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "weather-api" });
});

router.get("/weather", async (req, res) => {
  const { city } = req.query;
  if (!city)
    return res
      .status(400)
      .json({ error: "City must be provided, e.g. /weather?city=Boston" });

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
