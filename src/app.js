import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import weatherRouter from "./routes/weather.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // Mount router
  app.use("/", weatherRouter);

  app.use(errorHandler);

  return app;
}
