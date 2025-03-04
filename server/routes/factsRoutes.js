const express = require("express");
const router = express.Router();

const { getFacts } = require("../db/queries/facts");
  
// Get all facts route (example)
router.get("/", async (req, res) => {
try {
    const clubs = await getFacts();
    res.json(clubs);
} catch (error) {
    res.status(500).json({ error: "Failed to get facts" });
}
});

module.exports = router;