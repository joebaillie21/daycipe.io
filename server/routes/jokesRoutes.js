import { Router } from "express";
const router = Router();

import { getCurrentJokes, getJokes, createJoke, upvoteJoke, downvoteJoke } from "../db/queries/jokes.js";
  
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
    
        const requiredKeys = new Set(['date', 'content']);
        for(const key of requiredKeys) {
            if(!(key in joke)) {
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

// Upvote a joke
router.post("/:id/upvote", async (req, res) => {
    try {
        const jokeId = parseInt(req.params.id);
        if (isNaN(jokeId)) {
            res.status(400).json({ error: "Invalid joke ID" });
            return;
        }
        
        const result = await upvoteJoke(jokeId);
        res.json({ 
            isShown: result.is_shown,
            success: true, 
            jokeId: result.id, 
            newScore: result.score 
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to upvote joke: ${error}` });
    }
});

// Downvote a joke
router.post("/:id/downvote", async (req, res) => {
    try {
        const jokeId = parseInt(req.params.id);
        if (isNaN(jokeId)) {
            res.status(400).json({ error: "Invalid joke ID" });
            return;
        }
        
        const result = await downvoteJoke(jokeId);
        res.json({ 
            isShown: result.is_shown,
            success: true, 
            jokeId: result.id, 
            newScore: result.score 
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to downvote joke: ${error}` });
    }
});

export default router;