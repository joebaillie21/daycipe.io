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

// Create new joke
router.post("/create", async (req, res) => {
    try {
        const joke = req.body.joke;
        if(!joke) {
            res.status(400).json({error: `Request does not contain joke data.`});
            return;
        }
    
        const requiredKeys = new Set(['date', 'content', 'source']);
        for(const key in joke) {
            if(!key in requiredKeys) {
                res.status(400).json({ error: `Missing required key: ${key}` });
                return;
            }
        }
    
        const id = await createJoke(joke);
        res.json({jokeId: id});
    } catch (error) {
        res.status(500).json({ error: `Failed to create joke: ${error}` });
    }
});

export default router;