import { Router } from "express";
const router = Router();

import { getReports, getContentSpecificReport, createReport } from "../db/queries/reports.js";

// Get all reports
router.get("/", async (req, res) => {
    try {
        const clubs = await getReports();
        res.json(clubs);
        if (!clubs) {
            res.status(404).json({ error: "No reports found." });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve reports" });
    }
});

// Get content specific reports
router.get("/content/:type/:id", async (req, res) => {
    try {
        const { type, id } = req.params;
        const clubs = await getContentSpecificReport(type, id);
        if (!clubs) {
            res.status(404).json({ error: "No reports found for this content." });
            return;
        }
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve reports" });
    }
});

// Create new report
router.post("/create", async (req, res) => {
    try {
        const content_id = req.body.content_id;
        const content_type = req.body.content_type;
        const substance_of_report = req.body.substance_of_report;
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