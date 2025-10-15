import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "weather-api" })
);

// Weather fetch
app.get("/weather", (req, res) => {
  const { city } = req.query;
  if (!city)
    res.status(400).json({
      error: "city query param is required, e.g. /weather?city=Boston",
    });

  res.json({
    city,
    tempC: 22,
    conditions: "Partly Cloudy",
    source: "hardcoded",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`☀️ Weather API is listening on http://localhost:${PORT}`)
);

export default app;
