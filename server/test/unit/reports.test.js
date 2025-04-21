import request from "supertest";
import express, { json } from "express";
import reportRouter from "../../routes/reportsRoutes.js";
import { getContentSpecificReport, createReport, getReports } from "../../db/queries/reports.js";

jest.mock("../../db/queries/reports.js");

const app = express();
app.use(json());
app.use("/reports", reportRouter);


describe("GET Endpoints", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Success path for /reports
    test("GET /reports should return all reports", async () => {
        const mockReports = [
            { id: 1, type_of_reported_content: "joke", reported_content_id: 1, substance_of_report: "Report 1" },
            { id: 2, type_of_reported_content: "recipe", reported_content_id: 1, substance_of_report: "Report 2" },
            { id: 3, type_of_reported_content: "fact", reported_content_id: 1, substance_of_report: "Report 3" },
            { id: 4, type_of_reported_content: "fact", reported_content_id: 1, substance_of_report: "Report 4" }
        ];
        getReports.mockResolvedValue(mockReports);

        const response = await request(app).get("/reports");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockReports);
        expect(getReports).toHaveBeenCalledTimes(1);
    });

    // Success path for /reports/content/:type/:id
    test("GET /reports/content/:type/:id should return all reports", async () => {
        const mockReport = { id: 1, type_of_reported_content: "joke", reported_content_id: 1, substance_of_report: "Report 1" };
        getContentSpecificReport.mockResolvedValue([mockReport]);
        const response = await request(app).get("/reports/content/joke/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([mockReport]);
        expect(getContentSpecificReport).toHaveBeenCalledTimes(1);
    });

    // Alternate path for 'no report found'
    test("GET /reports/content/:type/:id should return 404 if no reports are found", async () => {
        getContentSpecificReport.mockResolvedValue(null);

        const response = await request(app).get("/reports/content/joke/1");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "No reports found for this content." });
        expect(getContentSpecificReport).toHaveBeenCalledTimes(1);
    });

    // Alternate paths for server errors
    test("GET /reports should handle errors gracefully", async () => {
        getReports.mockRejectedValue(new Error("Database error"));

        const response = await request(app).get("/reports");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to retrieve reports" });
    });

    test("GET /reports/content/:type/:id should handle errors gracefully", async () => {
        getContentSpecificReport.mockRejectedValue(new Error("Database error"));

        const response = await request(app).get("/reports/content/joke/1");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to retrieve reports" });
    });

});

describe("POST endpoints", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test for missing required keys in the report object
    test("should return 400 if report is missing required keys", async () => {
        const response = await request(app)
            .post("/reports/create")
            .send({ report: { content_type: "recipe", content_id: 1 } });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Request does not contain all required fields.");
    });

    // Test successful report creation
    test("should create a report and return the report ID", async () => {
        createReport.mockResolvedValue("12345");

        const reportData = {
            content_type: 'recipe',
            content_id: 1,
            substance_of_report: 'Inappropriate content',
        };

        const response = await request(app)
            .post("/reports/create")
            .send({
                content_type: 'recipe',
                content_id: 1,
                substance_of_report: 'Inappropriate content',
            });

        expect(response.status).toBe(200);
        expect(response.body.reportId).toBe("12345");
    });

    // Test for failure when createReport throws an error
    test("should return 500 if createReport fails", async () => {
        createReport.mockRejectedValue(new Error("Failed to create report"));

        const response = await request(app)
            .post("/reports/create")
            .send({
                content_type: "recipe",
                content_id: 1,
                substance_of_report: "Inappropriate content"
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to create report: Error: Failed to create report");
    });
});
