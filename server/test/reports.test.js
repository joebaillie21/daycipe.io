import request from "supertest";
import express, { json } from "express";
import reportsRouter from "../routes/reportsRoutes.js";
import { getReports, getCurrentReport, createReport } from "../db/queries/reports.js";

jest.mock("../db/queries/reports.js");

const app = express();
app.use(json());
app.use("/reports", reportsRouter);


describe("GET Endpoints", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Success path for /reports
    test("GET /reports should return all reports", async () => {
        const mockReports = [{ id: 1, type_of_reported_content: "joke", reported_content_id: 1, substance_of_report: "Report Text 1" },
        { id: 2, type_of_reported_content: "recipe", reported_content_id: 2, substance_of_report: "Report Text 2" },
        { id: 3, type_of_reported_content: "fact", reported_content_id: 3, substance_of_report: "Report Text 3" },
        { id: 4, type_of_reported_content: "fact", reported_content_id: 3, substance_of_report: "Report Text 4" }];
        getReports.mockResolvedValue(mockReports);

        const response = await request(app).get("/reports");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockReports);
        expect(getReports).toHaveBeenCalledTimes(1);
    });

    //Success path for /reports/content/:type/:id
    test("GET /reports/content/:type/:id should return content specific reports", async () => {
        const mockReports = [{ id: 1, type_of_reported_content: "joke", reported_content_id: 1, substance_of_report: "Report Text 1" }];
        getCurrentReport.mockResolvedValue(mockReports);

        const response = await request(app).get("/reports/content/joke/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockReports);
        expect(getCurrentReport).toHaveBeenCalledWith("joke", "1");
    });

    // Success path for /reports/content/:type/:id with no reports found
    test("GET /reports/content/:type/:id should return 404 if no reports are found", async () => {
        getCurrentReport.mockResolvedValue([]);

        const response = await request(app).get("/reports/content/joke/1");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "No reports found for this content." });
        expect(getCurrentReport).toHaveBeenCalledWith("joke", "1");
    });

    // Success path for /reports/content/:type/:id with invalid type or id
    test("GET /reports/content/:type/:id should return 400 if type or id is invalid", async () => {
        const response = await request(app).get("/reports/content/joke/abc");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid content type or ID." });
    });

    // Success path for /reports/content/:type/:id with missing type or id
    test("GET /reports/content/:type/:id should return 400 if type or id is missing", async () => {
        const response = await request(app).get("/reports/content/joke/");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid content type or ID." });
    });
});

// Test suite for POST endpoints in reportsRoutes.js





describe("POST endpoints", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test for missing report data in the request body
    test("should return 400 if reports data is missing", async () => {
        const response = await request(app)
            .post("/reports/create")
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Request does not contain report data.");
    });

    // Test for missing required keys in the report object
    test("should return 400 if report is missing required keys", async () => {
        const response = await request(app)
            .post("/reports/create")
            .send({ report: { substance_of_report: "report text 1" } });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing required keys: content_type, content_id");
    });

    // Test successful report creation
    test("should create a report and return the report_id", async () => {
        createReport.mockResolvedValue("12345");

        const reportData = {
            content_type: "joke",
            content_id: 1,
            substance_of_report: "Report Text 1"
        };

        const response = await request(app)
            .post("/reports/create")
            .send({ report: reportData });

        expect(response.status).toBe(200);
        expect(response.body.reportId).toBe("12345");
        expect(createReport).toHaveBeenCalledWith(reportData);
    });

    // Test for failure when createreport throws an error
    test("should return 500 if createreport fails", async () => {
        createReport.mockRejectedValue(new Error("Failed to create report"));

        const reportData = {
            content_type: "joke",
            content_id: 1,
            substance_of_report: "Report Text 1"
        };

        const response = await request(app)
            .post("/reports/create")
            .send({ report: reportData });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to create report: Error: Failed to create report");
    });
});
