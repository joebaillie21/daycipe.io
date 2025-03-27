import request from "supertest";
import express, {json} from "express";
import jokesRouter from "../routes/jokesRoutes.js";
import { getCurrentJokes, getJokes, createJoke } from "../db/queries/jokes.js";

// Mock the getCurrentjoke and getjokes functions
jest.mock("../db/queries/jokes.js");

const app = express();
app.use(json());
app.use("/jokes", jokesRouter);


describe("Jokes Routes", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Success path for /jokes
  test("GET /jokes should return all jokes", async () => {
    const mockJokes = [{ id: 1, joke: "Joke 1" }, { id: 2, joke: "Joke 2" }];
    getJokes.mockResolvedValue(mockJokes);

    const response = await request(app).get("/jokes");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockJokes);
    expect(getJokes).toHaveBeenCalledTimes(1);
  });

  // Success path for /jokes/today
  test("GET /jokes/today should return today's jokes", async () => {
    const mockJokes = [{ id: 1, joke: "Joke of the day" }];
    getCurrentJokes.mockResolvedValue(mockJokes);

    const response = await request(app).get("/jokes/today");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockJokes);
    expect(getCurrentJokes).toHaveBeenCalledTimes(1);
  });

  // Alternate path for 'no joke found'
  test("GET /jokes/today should return 404 if no jokes are found", async () => {
    getCurrentJokes.mockResolvedValue(null);

    const response = await request(app).get("/jokes/today");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No jokes of the day found." });
    expect(getCurrentJokes).toHaveBeenCalledTimes(1);
  });

  // Alternate paths for server errors
  test("GET /jokes should handle errors gracefully", async () => {
    getJokes.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/jokes");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get jokes" });
  });

  test("GET /jokes/today should handle errors gracefully", async () => {
    getCurrentJokes.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/jokes/today");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get jokes" });
  });

});

describe("POST endpoints", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for missing joke data in the request body
  test("should return 400 if jokes data is missing", async () => {
      const response = await request(app)
          .post("/jokes/create")
          .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Request does not contain joke data.");
  });

  // Test for missing required keys in the joke object
  test("should return 400 if joke is missing required keys", async () => {
      const response = await request(app)
          .post("/jokes/create")
          .send({ joke: { date: "2025-03-26" } });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required key: content");
  });

  // Test successful joke creation
  test("should create a joke and return the jokeId", async () => {
      createJoke.mockResolvedValue("12345");

      const jokeData = {
          date: "2025-03-26",
          content: "Some joke content"
      };

      const response = await request(app)
          .post("/jokes/create")
          .send({ joke: jokeData });

      expect(response.status).toBe(200);
      expect(response.body.jokeId).toBe("12345");
      expect(createJoke).toHaveBeenCalledWith(jokeData);
  });

  // Test for failure when createJoke throws an error
  test("should return 500 if createJoke fails", async () => {
      createJoke.mockRejectedValue(new Error("Failed to create joke"));

      const jokeData = {
          date: "2025-03-26",
          content: "Some joke content"
      };

      const response = await request(app)
          .post("/jokes/create")
          .send({ joke: jokeData });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to create joke: Error: Failed to create joke");
  });
});
