import request from "supertest";
import express, {json} from "express";
import recipesRouter from "../routes/recipesRoutes.js";
import { getRecipes, getCurrentRecipe, createRecipe } from "../db/queries/recipes.js";

jest.mock("../db/queries/recipes.js");

const app = express();
app.use(json());
app.use("/recipes", recipesRouter);


describe("GET Endpoints", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Success path for /recipes
  test("GET /recipes should return all recipes", async () => {
    const mockRecipes = [{ id: 1, recipe: "Recipe 1" }, { id: 2, recipe: "Recipe 2" }];
    getRecipes.mockResolvedValue(mockRecipes);

    const response = await request(app).get("/recipes");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipes);
    expect(getRecipes).toHaveBeenCalledTimes(1);
  });

  // Success path for /recipes/today
  test("GET /recipes/today should return today's recipes", async () => {
    const mockRecipe = { id: 1, recipe: "recipe of the day" };
    getCurrentRecipe.mockResolvedValue(mockRecipe);

    const response = await request(app).get("/recipes/today");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipe);
    expect(getCurrentRecipe).toHaveBeenCalledTimes(1);
  });

  // Alternate path for 'no recipe found'
  test("GET /recipes/today should return 404 if no recipes are found", async () => {
    getCurrentRecipe.mockResolvedValue(null);

    const response = await request(app).get("/recipes/today");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No recipes of the day found." });
    expect(getCurrentRecipe).toHaveBeenCalledTimes(1);
  });

  // Alternate paths for server errors
  test("GET /recipes should handle errors gracefully", async () => {
    getRecipes.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/recipes");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get recipes" });
  });

  test("GET /recipes/today should handle errors gracefully", async () => {
    getCurrentRecipe.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/recipes/today");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get recipes" });
  });

});

describe("POST endpoints", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for missing recipe data in the request body
  test("should return 400 if recipes data is missing", async () => {
      const response = await request(app)
          .post("/recipes/create")
          .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Request does not contain recipe data.");
  });

  // Test for missing required keys in the recipe object
  test("should return 400 if recipe is missing required keys", async () => {
      const response = await request(app)
          .post("/recipes/create")
          .send({ recipe: { date: "2025-03-26" } });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required key: content");
  });

  // Test successful recipe creation
  test("should create a recipe and return the recipeId", async () => {
      createRecipe.mockResolvedValue("12345");

      const recipeData = {
          date: "2025-03-26",
          content: "Some recipe content",
          category: "default"
      };

      const response = await request(app)
          .post("/recipes/create")
          .send({ recipe: recipeData });

      expect(response.status).toBe(200);
      expect(response.body.recipeId).toBe("12345");
      expect(createRecipe).toHaveBeenCalledWith(recipeData);
  });

  // Test for failure when createrecipe throws an error
  test("should return 500 if createrecipe fails", async () => {
      createRecipe.mockRejectedValue(new Error("Failed to create recipe"));

      const recipeData = {
          date: "2025-03-26",
          content: "Some recipe content",
          category: "default"
      };

      const response = await request(app)
          .post("/recipes/create")
          .send({ recipe: recipeData });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to create recipe: Error: Failed to create recipe");
  });
});
