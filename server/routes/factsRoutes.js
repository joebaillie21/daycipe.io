import { Router } from "express";
const router = Router();

import { getCurrentFact, getFacts } from "../db/queries/facts.js";
  
// Get all facts route (example)
router.get("/", async (req, res) => {
try {
    const clubs = await getFacts();
    res.json(clubs);
} catch (error) {
    res.status(500).json({ error: "Failed to get facts" });
}
});

// Get the curent date's fact
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

export default router;