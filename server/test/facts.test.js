import request from "supertest";
import express, {json} from "express";
import factsRouter from "../routes/factsRoutes.js";
import { getCurrentFact, getFacts, createFact } from "../db/queries/facts.js";

// Mock the getCurrentFact and getFacts functions
jest.mock("../db/queries/facts.js");

const app = express();
app.use(json());
app.use("/facts", factsRouter);

describe("GET Endpoints", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Success path for /facts
  test("GET /facts should return all facts", async () => {
    const mockFacts = [{ id: 1, fact: "Fact 1" }, { id: 2, fact: "Fact 2" }];
    getFacts.mockResolvedValue(mockFacts);

    const response = await request(app).get("/facts");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFacts);
    expect(getFacts).toHaveBeenCalledTimes(1);
  });

  // Success path for /facts/today
  test("GET /facts/today should return today's fact", async () => {
    const mockFact = { id: 1, fact: "Fact of the day" };
    getCurrentFact.mockResolvedValue(mockFact);

    const response = await request(app).get("/facts/today");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFact);
    expect(getCurrentFact).toHaveBeenCalledTimes(1);
  });

  // Alternate path for 'no fact found'
  test("GET /facts/today should return 404 if no fact is found", async () => {
    getCurrentFact.mockResolvedValue(null);

    const response = await request(app).get("/facts/today");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No fact of the day found." });
    expect(getCurrentFact).toHaveBeenCalledTimes(1);
  });

  // Alternate paths for server errors
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

describe("POST endpoints", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for missing fact data in the request body
  test("should return 400 if fact data is missing", async () => {
      const response = await request(app)
          .post("/facts/create")
          .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Request does not contain fact data.");
  });

  // Test for missing required keys in the fact object
  test("should return 400 if fact is missing required keys", async () => {
      const response = await request(app)
          .post("/facts/create")
          .send({ fact: { date: "2025-03-26", content: "Some content" } });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required key: source");
  });

  // Test successful fact creation
  test("should create a fact and return the factId", async () => {
      createFact.mockResolvedValue("12345");

      const factData = {
          date: "2025-03-26",
          content: "Some fact content",
          source: "Some source",
          category: "Some category"
      };

      const response = await request(app)
          .post("/facts/create")
          .send({ fact: factData });

      expect(response.status).toBe(200);
      expect(response.body.factId).toBe("12345");
      expect(createFact).toHaveBeenCalledWith(factData);
  });

  // Test for failure when createFact throws an error
  test("should return 500 if createFact fails", async () => {
      createFact.mockRejectedValue(new Error("Failed to create fact"));

      const factData = {
          date: "2025-03-26",
          content: "Some fact content",
          source: "Some source",
          category: "Some category"
      };

      const response = await request(app)
          .post("/facts/create")
          .send({ fact: factData });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to create fact: Error: Failed to create fact");
  });
});
