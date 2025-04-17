import { Router } from "express";
const router = Router();

import { createFact, getCurrentFact, getFacts, upvoteFact, downvoteFact, getCurrentFactByCategory, VALID_FACT_CATEGORIES } from "../db/queries/facts.js";
  
// Get all facts
router.get("/", async (req, res) => {
try {
    const clubs = await getFacts();
    res.json(clubs);
} catch (error) {
    res.status(500).json({ error: "Failed to get facts" });
}
});

// Get the current date's fact
router.get("/today", async (req, res) => {
    try {
        const clubs = await getCurrentFact();
        if(!clubs) {
            res.status(404).json({error: "No fact of the day found."});
            return;
        }

        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: "Failed to get facts" });
    }
});

// Create new fact
router.post("/create", async (req, res) => {
    try {
        if(!req.body || !('fact' in req.body)) {
            res.status(400).json({error: `Request does not contain fact data.`});
            return;
        }
        
        const fact = req.body.fact;
        const requiredKeys = ['date', 'content', 'source', 'category'];
        for(const key of requiredKeys) {
            if(!(key in fact)) {
                res.status(400).json({ error: `Missing required key: ${key}` });
                return;
            }
        }
    
        const id = await createFact(fact);
        res.json({factId: id});
    } catch (error) {
        res.status(500).json({ error: `Failed to create fact: ${error}` });
    }
});

// Upvote a fact
router.post("/:id/upvote", async (req, res) => {
    try {
        const factId = parseInt(req.params.id);
        if (isNaN(factId)) {
            res.status(400).json({ error: "Invalid fact ID" });
            return;
        }
        
        const result = await upvoteFact(factId);
        res.json({ 
            isShown: result.is_shown,
            success: true, 
            factId: result.id, 
            newScore: result.score 
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to upvote fact: ${error}` });
    }
});

// Downvote a fact
router.post("/:id/downvote", async (req, res) => {
    try {
        const factId = parseInt(req.params.id);
        if (isNaN(factId)) {
            res.status(400).json({ error: "Invalid fact ID" });
            return;
        }
        
        const result = await downvoteFact(factId);
        res.json({ 
            isShown: result.is_shown,
            success: true, 
            factId: result.id, 
            newScore: result.score 
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to downvote fact: ${error}` });
    }
});

// Get today's fact by category
router.get("/today/:category", async (req, res) => {
    const category = req.params.category.toLowerCase();

    if (!VALID_FACT_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    try {
        const fact = await getCurrentFactByCategory(category);
        if (!fact) {
            return res.status(404).json({ error: `No fact found for ${category} today.` });
        }
        res.json(fact);
    } catch (error) {
        res.status(500).json({ error: `Failed to get fact for ${category}: ${error}` });
    }
});

export default router;