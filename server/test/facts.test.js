import request from "supertest";
import express from "express";
import factsRouter from "../routes/factsRoutes.js";
import { getCurrentFact, getFacts } from "../db/queries/facts.js";

// Mock the getCurrentFact and getFacts functions
jest.mock("../db/queries/facts.js");

const app = express();
app.use("/facts", factsRouter);

describe("Facts Routes", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /facts should return all facts", async () => {
    const mockFacts = [{ id: 1, fact: "Fact 1" }, { id: 2, fact: "Fact 2" }];
    getFacts.mockResolvedValue(mockFacts);

    const response = await request(app).get("/facts");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFacts);
    expect(getFacts).toHaveBeenCalledTimes(1);
  });

  test("GET /facts/today should return today's fact", async () => {
    const mockFact = { id: 1, fact: "Fact of the day" };
    getCurrentFact.mockResolvedValue(mockFact);

    const response = await request(app).get("/facts/today");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFact);
    expect(getCurrentFact).toHaveBeenCalledTimes(1);
  });

  test("GET /facts/today should return 404 if no fact is found", async () => {
    getCurrentFact.mockResolvedValue(null);

    const response = await request(app).get("/facts/today");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No fact of the day found." });
    expect(getCurrentFact).toHaveBeenCalledTimes(1);
  });

  test("GET /facts should handle errors gracefully", async () => {
    getFacts.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/facts");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get facts" });
  });

  test("GET /facts/today should handle errors gracefully", async () => {
    getCurrentFact.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/facts/today");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get facts" });
  });

});
