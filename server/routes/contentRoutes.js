import { Router } from "express";
const router = Router();

import { getFactsByDateRange } from "../db/queries/facts.js";
import { getJokesByDateRange } from "../db/queries/jokes.js";
import { getRecipesByDateRange } from "../db/queries/recipes.js";

// Get content for a date range
router.get("/range", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !isValidDate(startDate)) {
            return res.status(400).json({ error: "Valid startDate parameter is required (YYYY-MM-DD)" });
        }
        
        if (endDate && !isValidDate(endDate)) {
            return res.status(400).json({ error: "If provided, endDate must be valid (YYYY-MM-DD)" });
        }
        
        if (endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ error: "endDate cannot be earlier than startDate" });
        }

        const [facts, jokes, recipes] = await Promise.all([
            getFactsByDateRange(startDate, endDate || null),
            getJokesByDateRange(startDate, endDate || null),
            getRecipesByDateRange(startDate, endDate || null)
        ]);
        
        const response = {
            dateRange: {
                startDate,
                endDate: endDate || startDate
            },
            content: {
                facts,
                jokes,
                recipes
            },
            counts: {
                facts: facts.length,
                jokes: jokes.length,
                recipes: recipes.length,
                total: facts.length + jokes.length + recipes.length
            }
        };
        
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: `Failed to get content: ${error.message}` });
    }
});

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

export default router;