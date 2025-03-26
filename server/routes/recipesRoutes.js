import { Router } from "express";
const router = Router();

import { getCurrentRecipe, getRecipes, createRecipe } from "../db/queries/recipes.js";
  
// Get all recipes
router.get("/", async (req, res) => {
try {
    const clubs = await getRecipes();
    res.json(clubs);
} catch (error) {
    res.status(500).json({ error: "Failed to get recipes" });
}
});

// Get the current date's recipe
router.get("/today", async (req, res) => {
    try {
        const clubs = await getCurrentRecipe();
        if(!clubs) {
            res.status(404).json({error: "No recipes of the day found."});
            return;
        }

        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: "Failed to get recipes" });
    }
});

// Create new recipe
router.post("/create", async (req, res) => {
    try {
        const recipe = req.body.recipe;
        if(!recipe) {
            res.status(400).json({error: `Request does not contain recipe data.`});
            return;
        }
    
        const requiredKeys = new Set(['date', 'content', 'category']);
        for(const key in recipe) {
            if(!key in requiredKeys) {
                res.status(400).json({ error: `Missing required key: ${key}` });
                return;
            }
        }
    
        const id = await createRecipe(recipe);
        res.json({recipeId: id});
    } catch (error) {
        res.status(500).json({ error: `Failed to create recipe: ${error}` });
    }
});

export default router;