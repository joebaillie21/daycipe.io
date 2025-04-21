import request from "supertest";
import express, {json} from "express";
import factsRouter from "../../routes/factsRoutes.js";
import { getCurrentFact, getFacts, createFact, upvoteFact, downvoteFact, getAllCategoryFactsForToday } from "../../db/queries/facts.js";

jest.mock("../../db/queries/facts.js");

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
    expect(response.body).toEqual({ error: "Failed to get facts: Database error" });
  });

});

describe("GET Endpoints with category support", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test getting today's fact with no category (default behavior)
  test("GET /facts/today with no category should return default fact", async () => {
    const mockFact = { id: 1, content: "Default fact", category: "math" };
    getCurrentFact.mockResolvedValue(mockFact);

    const response = await request(app).get("/facts/today");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFact);
    expect(getCurrentFact).toHaveBeenCalledWith(null);
  });

  // Test getting today's fact with specific category
  test("GET /facts/today with specific category should return filtered fact", async () => {
    const mockFact = { id: 2, content: "Physics fact", category: "physics" };
    getCurrentFact.mockResolvedValue(mockFact);

    const response = await request(app).get("/facts/today?category=physics");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFact);
    expect(getCurrentFact).toHaveBeenCalledWith("physics");
  });

  // Test getting all category facts for today
  test("GET /facts/today with category=all should return one fact per category", async () => {
    const mockFacts = [
      { id: 1, content: "Math fact", category: "math" },
      { id: 2, content: "Physics fact", category: "physics" },
      { id: 3, content: "Bio fact", category: "bio" }
    ];
    getAllCategoryFactsForToday.mockResolvedValue(mockFacts);

    const response = await request(app).get("/facts/today?category=all");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockFacts);
    expect(getAllCategoryFactsForToday).toHaveBeenCalledTimes(1);
  });

  // Test getting specific category with no fact available
  test("GET /facts/today with specific category should return 404 if no fact found", async () => {
    getCurrentFact.mockResolvedValue(null);

    const response = await request(app).get("/facts/today?category=compsci");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No fact of the day found." });
    expect(getCurrentFact).toHaveBeenCalledWith("compsci");
  });

  // Test getting all category facts with none available
  test("GET /facts/today with category=all should return 404 if no facts found", async () => {
    getAllCategoryFactsForToday.mockResolvedValue([]);

    const response = await request(app).get("/facts/today?category=all");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No facts of the day found." });
    expect(getAllCategoryFactsForToday).toHaveBeenCalledTimes(1);
  });

  // Test error handling for category-based queries
  test("GET /facts/today with category parameter should handle errors", async () => {
    getAllCategoryFactsForToday.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/facts/today?category=all");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get facts: Database error" });
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

describe("Vote endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // UPVOTE TESTS
  
  // Test successful upvote operation
  test("POST /facts/:id/upvote should upvote a fact", async () => {
    const mockResult = { id: 1, content: "Test fact", score: 5, is_shown: true };
    upvoteFact.mockResolvedValue(mockResult);

    const response = await request(app).post("/facts/1/upvote");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      factId: 1,
      newScore: 5,
      isShown: true
    });
    expect(upvoteFact).toHaveBeenCalledWith(1);
  });

  // Test upvote with invalid fact ID format
  test("POST /facts/:id/upvote should return 400 for invalid ID", async () => {
    const response = await request(app).post("/facts/invalid/upvote");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid fact ID" });
    expect(upvoteFact).not.toHaveBeenCalled();
  });

  // Test error handling when upvote operation fails
  test("POST /facts/:id/upvote should handle errors", async () => {
    upvoteFact.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/facts/1/upvote");
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to upvote fact: Error: Database error" });
  });

  // DOWNVOTE TESTS
  
  // Test successful downvote operation
  test("POST /facts/:id/downvote should downvote a fact", async () => {
    const mockResult = { id: 1, content: "Test fact", score: 3, is_shown: true };
    downvoteFact.mockResolvedValue(mockResult);

    const response = await request(app).post("/facts/1/downvote");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      factId: 1,
      newScore: 3,
      isShown: true
    });
    expect(downvoteFact).toHaveBeenCalledWith(1);
  });

  // Test downvote with invalid fact ID format
  test("POST /facts/:id/downvote should return 400 for invalid ID", async () => {
    const response = await request(app).post("/facts/invalid/downvote");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid fact ID" });
    expect(downvoteFact).not.toHaveBeenCalled();
  });

  // Test error handling when downvote operation fails
  test("POST /facts/:id/downvote should handle errors", async () => {
    downvoteFact.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/facts/1/downvote");
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to downvote fact: Error: Database error" });
  });

  // Test that is_shown flag is updated when score drops below threshold
  test("POST /facts/:id/downvote should reflect when content is hidden", async () => {
    const mockResult = { id: 1, content: "Test fact", score: -6, is_shown: false };
    downvoteFact.mockResolvedValue(mockResult);

    const response = await request(app).post("/facts/1/downvote");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      factId: 1,
      newScore: -6,
      isShown: false
    });
  });
});