import request from "supertest";
import express, { json } from "express";
import contentRouter from "../../routes/contentRoutes.js";
import { getFactsByDateRange } from "../../db/queries/facts.js";
import { getJokesByDateRange } from "../../db/queries/jokes.js";
import { getRecipesByDateRange } from "../../db/queries/recipes.js";

jest.mock("../../db/queries/facts.js");
jest.mock("../../db/queries/jokes.js");
jest.mock("../../db/queries/recipes.js");

const app = express();
app.use(json());
app.use("/content", contentRouter);

describe("Content Range GET Endpoint", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test successful retrieval for a single date
  test("GET /content/range should return content for a single date when only startDate provided", async () => {
    const mockFacts = [{ id: 1, content: "Test fact", date: "2023-10-15" }];
    const mockJokes = [{ id: 1, content: "Test joke", date: "2023-10-15" }];
    const mockRecipes = [{ id: 1, content: "Test recipe", date: "2023-10-15" }];
    
    getFactsByDateRange.mockResolvedValue(mockFacts);
    getJokesByDateRange.mockResolvedValue(mockJokes);
    getRecipesByDateRange.mockResolvedValue(mockRecipes);

    const response = await request(app).get("/content/range?startDate=2023-10-15");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dateRange: {
        startDate: "2023-10-15",
        endDate: "2023-10-15"
      },
      content: {
        facts: mockFacts,
        jokes: mockJokes,
        recipes: mockRecipes
      },
      counts: {
        facts: 1,
        jokes: 1,
        recipes: 1,
        total: 3
      }
    });
    
    expect(getFactsByDateRange).toHaveBeenCalledWith("2023-10-15", null);
    expect(getJokesByDateRange).toHaveBeenCalledWith("2023-10-15", null);
    expect(getRecipesByDateRange).toHaveBeenCalledWith("2023-10-15", null);
  });

  // Test successful retrieval for a date range
  test("GET /content/range should return content for a date range", async () => {
    const mockFacts = [
      { id: 1, content: "Fact 1", date: "2023-10-15" },
      { id: 2, content: "Fact 2", date: "2023-10-16" }
    ];
    const mockJokes = [
      { id: 1, content: "Joke 1", date: "2023-10-15" },
      { id: 2, content: "Joke 2", date: "2023-10-17" }
    ];
    const mockRecipes = [
      { id: 1, content: "Recipe 1", date: "2023-10-16" },
      { id: 2, content: "Recipe 2", date: "2023-10-17" }
    ];
    
    getFactsByDateRange.mockResolvedValue(mockFacts);
    getJokesByDateRange.mockResolvedValue(mockJokes);
    getRecipesByDateRange.mockResolvedValue(mockRecipes);

    const response = await request(app).get("/content/range?startDate=2023-10-15&endDate=2023-10-17");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dateRange: {
        startDate: "2023-10-15",
        endDate: "2023-10-17"
      },
      content: {
        facts: mockFacts,
        jokes: mockJokes,
        recipes: mockRecipes
      },
      counts: {
        facts: 2,
        jokes: 2,
        recipes: 2,
        total: 6
      }
    });
    
    expect(getFactsByDateRange).toHaveBeenCalledWith("2023-10-15", "2023-10-17");
    expect(getJokesByDateRange).toHaveBeenCalledWith("2023-10-15", "2023-10-17");
    expect(getRecipesByDateRange).toHaveBeenCalledWith("2023-10-15", "2023-10-17");
  });

  // Test empty results
  test("GET /content/range should handle empty results", async () => {
    getFactsByDateRange.mockResolvedValue([]);
    getJokesByDateRange.mockResolvedValue([]);
    getRecipesByDateRange.mockResolvedValue([]);

    const response = await request(app).get("/content/range?startDate=2025-01-01");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dateRange: {
        startDate: "2025-01-01",
        endDate: "2025-01-01"
      },
      content: {
        facts: [],
        jokes: [],
        recipes: []
      },
      counts: {
        facts: 0,
        jokes: 0,
        recipes: 0,
        total: 0
      }
    });
  });

  // Test missing startDate parameter
  test("GET /content/range should return 400 if startDate is missing", async () => {
    const response = await request(app).get("/content/range");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ 
      error: "Valid startDate parameter is required (YYYY-MM-DD)" 
    });
  });

  // Test invalid date format
  test("GET /content/range should return 400 if date format is invalid", async () => {
    const response = await request(app).get("/content/range?startDate=15-10-2023");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ 
      error: "Valid startDate parameter is required (YYYY-MM-DD)" 
    });
  });

  // Test invalid endDate format
  test("GET /content/range should return 400 if endDate format is invalid", async () => {
    const response = await request(app).get("/content/range?startDate=2023-10-15&endDate=invalid");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ 
      error: "If provided, endDate must be valid (YYYY-MM-DD)" 
    });
  });

  // Test endDate before startDate
  test("GET /content/range should return 400 if endDate is before startDate", async () => {
    const response = await request(app).get("/content/range?startDate=2023-10-15&endDate=2023-10-10");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ 
      error: "endDate cannot be earlier than startDate" 
    });
  });

  // Test server error handling
  test("GET /content/range should handle server errors", async () => {
    getFactsByDateRange.mockRejectedValue(new Error("Database connection error"));
    
    const response = await request(app).get("/content/range?startDate=2023-10-15");
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ 
      error: "Failed to get content: Database connection error" 
    });
  });

  // Test partial data error handling
  test("GET /content/range should handle partial data failures", async () => {
    getFactsByDateRange.mockResolvedValue([{ id: 1, content: "Test fact" }]);
    getJokesByDateRange.mockRejectedValue(new Error("Jokes database error"));
    getRecipesByDateRange.mockResolvedValue([]);
    
    const response = await request(app).get("/content/range?startDate=2023-10-15");
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ 
      error: "Failed to get content: Jokes database error" 
    });
  });
});