import { pool } from "../conn.js";

// Gets all reports from the database
// This function retrieves all reports from the reports table in the database.
export const getReports = async () => {
    const result = await pool.query("SELECT * FROM reports");
    return result.rows;
};

// Get all reports for a specific content type and content ID
// This function retrieves all reports related to a specific type of content and its ID.
export const getContentSpecificReport = async (content_type, content_id) => {
    const query = "SELECT * FROM reports WHERE reports.type_of_reported_content = $1 AND reports.content_id = $2";
    const values = [content_type, content_id];

    const result = await pool.query(query, values);
    return result.rows;
};


// Create a new report in the database
// This function inserts a new report into the reports table with the specified content type, content ID, and substance of the report.
export const createReport = async (content_type, content_id, substance_of_report) => {
    const query = `INSERT INTO reports (type_of_reported_content, content_id, substance) VALUES ($1, $2, $3) RETURNING id`;
    const values = [
        content_type,
        content_id,
        substance_of_report
    ];

    const result = await pool.query(query, values);
    return result.rows[0].id;
}
