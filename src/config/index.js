import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  weatherApiKey: process.env.VISUAL_CROSSING_API_KEY,
};
