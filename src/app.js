import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { getWeatherForCity } from "./services/weatherService.js";

export function createApp() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "weather-api" });
  });

  // Weather endpoint
  app.get("/weather", async (req, res) => {
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

  return app;
}
