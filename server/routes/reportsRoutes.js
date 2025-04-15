import { Router } from "express";
const router = Router();

import { getReports, getContentSpecificReports, createReport } from "../db/queries/reports.js";

// Get all reports
router.get("/", async (req, res) => {
    try {
        const clubs = await getReports();
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: "Failed to get reports" });
    }
});

// Get content specific reports
router.get("/content/:type/:id", async (req, res) => {
    try {
        const { type, id } = req.params;
        const clubs = await getContentSpecificReports(type, id);
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: "Failed to get reports" });
    }
});

// Create new report
router.post("/create", async (req, res) => {
    try {
        const { content_type, content_id, substance_of_report } = req.body;
        if (!content_type || !content_id || !substance_of_report) {
            res.status(400).json({ error: `Request does not contain all required fields.` });
            return;
        }

        const id = await createReport(content_type, content_id, substance_of_report);
        res.json({ reportId: id });
    } catch (error) {
        res.status(500).json({ error: `Failed to create report: ${error}` });
    }
});

export default router;