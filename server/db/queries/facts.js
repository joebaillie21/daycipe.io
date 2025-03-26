import { pool } from "../conn.js";

export const getFacts = async () => {
    const result = await pool.query("SELECT * FROM facts");
    return result.rows;
};

export const getCurrentFact = async () => {
    const result = await pool.query("SELECT * FROM facts WHERE facts.date=CURRENT_DATE LIMIT 1");
    return result.rows[0];
}

export const createFact = async (factData) => {
    const query = `INSERT INTO facts (date, content, source, category) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [
        factData.date,
        factData.content,
        factData.source,
        factData.category
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
}
