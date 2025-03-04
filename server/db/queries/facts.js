import { pool } from "../conn.js";

// Get all facts (example)
export const getFacts = async () => {
    const result = await pool.query("SELECT * FROM facts");
    return result.rows;
};
