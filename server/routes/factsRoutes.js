import { Router } from "express";
const router = Router();

import { getFacts } from "../db/queries/facts.js";
  
// Get all facts route (example)
router.get("/", async (req, res) => {
try {
    const clubs = await getFacts();
    res.json(clubs);
} catch (error) {
    res.status(500).json({ error: "Failed to get facts" });
}
});

export default router;