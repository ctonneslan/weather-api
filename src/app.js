import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

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
  app.get("/weather", (req, res) => {
    const { city } = req.query;
    if (!city)
      return res
        .status(400)
        .json({ error: "City must be provided, e.g. /weather?city=Boston" });

    res.json({
      city,
      tempC: 22,
      conditions: "Partly Cloudy",
      source: "hardcoded",
    });
  });

  return app;
}
