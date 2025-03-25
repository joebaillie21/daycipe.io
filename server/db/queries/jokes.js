import { pool } from "../conn.js";

export const getJokes = async () => {
    const result = await pool.query("SELECT * FROM jokes");
    return result.rows;
};

export const getCurrentJokes = async () => {
    const result = await pool.query("SELECT * FROM jokes WHERE jokes.date=CURRENT_DATE ORDER BY score LIMIT 3");
    return result.rows[0];
}
