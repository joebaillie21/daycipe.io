import request from "supertest";
import express, {json} from "express";
import recipesRouter from "../../routes/recipesRoutes.js";
import { getRecipes, getCurrentRecipe, createRecipe, upvoteRecipe, downvoteRecipe, getAllCategoryRecipesForToday } from "../../db/queries/recipes.js";

jest.mock("../../db/queries/recipes.js");

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
  test("GET /recipes/today without category should return today's recipe (backward compatibility)", async () => {
    const mockRecipe = { id: 1, recipe: "recipe of the day", category: "default" };
    getCurrentRecipe.mockResolvedValue(mockRecipe);

    const response = await request(app).get("/recipes/today");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipe);
    expect(getCurrentRecipe).toHaveBeenCalledTimes(1);
    expect(getCurrentRecipe).toHaveBeenCalledWith(null);
  });
  
  // Test for specific category recipe
  test("GET /recipes/today with category parameter should return recipe for that category", async () => {
    const mockRecipe = { id: 2, recipe: "vegan recipe", category: "veganism" };
    getCurrentRecipe.mockResolvedValue(mockRecipe);

    const response = await request(app).get("/recipes/today?category=veganism");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRecipe);
    expect(getCurrentRecipe).toHaveBeenCalledTimes(1);
    expect(getCurrentRecipe).toHaveBeenCalledWith("veganism");
  });
  
  // Test for all categories
  test("GET /recipes/today?category=all should return one recipe per category", async () => {
    const mockCategoryRecipes = [
      { id: 1, recipe: "default recipe", category: "default", score: 5, is_shown: true },
      { id: 2, recipe: "vegan recipe", category: "veganism", score: 3, is_shown: true },
      { id: 3, recipe: "vegetarian recipe", category: "vegetarianism", score: 8, is_shown: true }
    ];
    
    getAllCategoryRecipesForToday.mockResolvedValue(mockCategoryRecipes);

    const response = await request(app).get("/recipes/today?category=all");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCategoryRecipes);
    expect(getAllCategoryRecipesForToday).toHaveBeenCalledTimes(1);
    expect(getCurrentRecipe).not.toHaveBeenCalled();
  });
  
  // Test for empty result with all categories
  test("GET /recipes/today?category=all should return 404 when no recipes found", async () => {
    getAllCategoryRecipesForToday.mockResolvedValue([]);

    const response = await request(app).get("/recipes/today?category=all");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No recipes of the day found." });
    expect(getAllCategoryRecipesForToday).toHaveBeenCalledTimes(1);
  });

  // Alternate path for 'no recipe found'
  test("GET /recipes/today should return 404 if no recipes are found", async () => {
    getCurrentRecipe.mockResolvedValue(null);

    const response = await request(app).get("/recipes/today");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No recipe of the day found." });
    expect(getCurrentRecipe).toHaveBeenCalledTimes(1);
  });
  
  // Test for no recipe found in specific category
  test("GET /recipes/today with category should return 404 if no recipe found for that category", async () => {
    getCurrentRecipe.mockResolvedValue(null);

    const response = await request(app).get("/recipes/today?category=kosher");
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No recipe of the day found." });
    expect(getCurrentRecipe).toHaveBeenCalledTimes(1);
    expect(getCurrentRecipe).toHaveBeenCalledWith("kosher");
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
    expect(response.body).toEqual({ error: "Failed to get recipes: Database error" });
  });
  
  test("GET /recipes/today?category=all should handle errors gracefully", async () => {
    getAllCategoryRecipesForToday.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/recipes/today?category=all");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to get recipes: Database error" });
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

describe("Vote endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // UPVOTE TESTS
  
  // Test successful upvote operation for recipes
  test("POST /recipes/:id/upvote should upvote a recipe", async () => {
    const mockResult = { id: 1, content: "Test recipe", score: 5, is_shown: true };
    upvoteRecipe.mockResolvedValue(mockResult);

    const response = await request(app).post("/recipes/1/upvote");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      recipeId: 1,
      newScore: 5,
      isShown: true
    });
    expect(upvoteRecipe).toHaveBeenCalledWith(1);
  });

  // Test upvote with invalid recipe ID format
  test("POST /recipes/:id/upvote should return 400 for invalid ID", async () => {
    const response = await request(app).post("/recipes/invalid/upvote");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid recipe ID" });
    expect(upvoteRecipe).not.toHaveBeenCalled();
  });

  // Test error handling when recipe upvote operation fails
  test("POST /recipes/:id/upvote should handle errors", async () => {
    upvoteRecipe.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/recipes/1/upvote");
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to upvote recipe: Error: Database error" });
  });

  // DOWNVOTE TESTS
  
  // Test successful downvote operation for recipes
  test("POST /recipes/:id/downvote should downvote a recipe", async () => {
    const mockResult = { id: 1, content: "Test recipe", score: 3, is_shown: true };
    downvoteRecipe.mockResolvedValue(mockResult);

    const response = await request(app).post("/recipes/1/downvote");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      recipeId: 1,
      newScore: 3,
      isShown: true
    });
    expect(downvoteRecipe).toHaveBeenCalledWith(1);
  });

  // Test downvote with invalid recipe ID format
  test("POST /recipes/:id/downvote should return 400 for invalid ID", async () => {
    const response = await request(app).post("/recipes/invalid/downvote");
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid recipe ID" });
    expect(downvoteRecipe).not.toHaveBeenCalled();
  });

  // Test error handling when recipe downvote operation fails
  test("POST /recipes/:id/downvote should handle errors", async () => {
    downvoteRecipe.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/recipes/1/downvote");
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to downvote recipe: Error: Database error" });
  });

  // Test that is_shown flag is properly updated for recipes when score drops below threshold
  test("POST /recipes/:id/downvote should reflect when content is hidden", async () => {
    const mockResult = { id: 1, content: "Test recipe", score: -6, is_shown: false };
    downvoteRecipe.mockResolvedValue(mockResult);

    const response = await request(app).post("/recipes/1/downvote");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      recipeId: 1,
      newScore: -6,
      isShown: false
    });
  });
});
