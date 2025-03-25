import { pool } from "../conn.js";

export const getFacts = async () => {
    const result = await pool.query("SELECT * FROM facts");
    return result.rows;
};

export const getCurrentFact = async () => {
    const result = await pool.query("SELECT * FROM facts WHERE facts.date=CURRENT_DATE LIMIT 1");
    return result.rows[0];
}
