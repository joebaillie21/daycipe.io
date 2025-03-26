import { pool } from "../conn.js";

export const getJokes = async () => {
    const result = await pool.query("SELECT * FROM jokes");
    return result.rows;
};

export const getCurrentJokes = async () => {
    const result = await pool.query("SELECT * FROM jokes WHERE jokes.date=CURRENT_DATE ORDER BY score LIMIT 3");
    return result.rows[0];
}

export const createJoke = async (jokeData) => {
    const query = `INSERT INTO jokes (date, content, source) VALUES ($1, $2, $3) RETURNING id`;
    const values = [
        jokeData.date,
        jokeData.content,
        jokeData.source
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
}