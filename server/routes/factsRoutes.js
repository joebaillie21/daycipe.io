import { Router } from "express";
const router = Router();

import { createFact, getCurrentFact, getFacts } from "../db/queries/facts.js";
  
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

export default router;