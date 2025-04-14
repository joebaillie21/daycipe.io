import { Router } from "express";
const router = Router();

import { getCurrentRecipe, getRecipes, createRecipe, upvoteRecipe, downvoteRecipe } from "../db/queries/recipes.js";
  
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
        for(const key of requiredKeys) {
            if(!(key in recipe)) {
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

// Upvote a recipe
router.post("/:id/upvote", async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            res.status(400).json({ error: "Invalid recipe ID" });
            return;
        }
        
        const result = await upvoteRecipe(recipeId);
        res.json({ 
            isShown: result.is_shown,
            success: true, 
            recipeId: result.id, 
            newScore: result.score 
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to upvote recipe: ${error}` });
    }
});

// Downvote a recipe
router.post("/:id/downvote", async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            res.status(400).json({ error: "Invalid recipe ID" });
            return;
        }
        
        const result = await downvoteRecipe(recipeId);
        res.json({ 
            isShown: result.is_shown,
            success: true, 
            recipeId: result.id, 
            newScore: result.score 
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to downvote recipe: ${error}` });
    }
});

export default router;