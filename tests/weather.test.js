import express from "express";
import request from "supertest";

const app = express();
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "weather-api" })
);

describe("Weather API basic checks", () => {
  test("GET /health returns service ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("weather-api");
  });
});
