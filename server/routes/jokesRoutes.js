import { Router } from "express";
const router = Router();

import { getCurrentJokes, getJokes } from "../db/queries/jokes.js";
  
// Get all jokes
router.get("/", async (req, res) => {
try {
    const clubs = await getJokes();
    res.json(clubs);
} catch (error) {
    res.status(500).json({ error: "Failed to get jokes" });
}
});

// Get the current date's jokes
router.get("/today", async (req, res) => {
    try {
        const clubs = await getCurrentJokes();
        if(!clubs) {
            res.status(404).json({error: "No jokes of the day found."});
            return;
        }

        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: "Failed to get jokes" });
    }
});

export default router;