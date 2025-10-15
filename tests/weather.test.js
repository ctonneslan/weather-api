import express from "express";
import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("Weather API", () => {
  test("GET /health returns service ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("weather-api");
  });

  test("GET /weather without city should return 400", async () => {
    const res = await request(app).get("/weather");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(
      /City must be provided, e.g. \/weather\?city=Boston/
    );
  });

  test("GET /weather?city=Boston should return mock data", async () => {
    const res = await request(app).get("/weather?city=Boston");
    expect(res.statusCode).toBe(200);
    expect(res.body.city).toBe("Boston");
    expect(res.body.tempC).toBe(22);
    expect(res.body.conditions).toBe("Partly Cloudy");
    expect(res.body.source).toBe("hardcoded");
  });
});
