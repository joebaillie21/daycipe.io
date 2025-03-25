import { Router } from "express";
const router = Router();

import { getCurrentRecipe, getRecipes } from "../db/queries/recipes.js";
  
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

export default router;