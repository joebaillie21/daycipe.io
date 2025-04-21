import { pool } from "../conn.js";
import { evaluateContentVisibility } from "../../config/contentRules.js";

export const getJokes = async () => {
    const result = await pool.query("SELECT * FROM jokes");
    return result.rows;
};

export const getCurrentJokes = async () => {
    const result = await pool.query("SELECT * FROM jokes WHERE jokes.date=CURRENT_DATE ORDER BY score LIMIT 3");
    return result.rows;
}

export const getJokesByDateRange = async (startDate, endDate = null) => {
    // If no end date provided, search only for the start date
    const actualEndDate = endDate || startDate;
    
    const query = `
        SELECT * FROM jokes 
        WHERE date >= $1 AND date <= $2 AND is_shown = TRUE
        ORDER BY date DESC, score DESC
    `;
    const result = await pool.query(query, [startDate, actualEndDate]);
    return result.rows;
};

export const createJoke = async (jokeData) => {
    const query = `INSERT INTO jokes (date, content) VALUES ($1, $2) RETURNING id`;
    const values = [
        jokeData.date,
        jokeData.content
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
}

export const upvoteJoke = async (jokeId) => {
    const query = `UPDATE jokes SET score = score + 1 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [jokeId]);
    const updatedJoke = result.rows[0];
    
    await updateJokeVisibility(updatedJoke);
    return updatedJoke;
}

export const downvoteJoke = async (jokeId) => {
    const query = `UPDATE jokes SET score = score - 1 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [jokeId]);
    const updatedJoke = result.rows[0];
    
    await updateJokeVisibility(updatedJoke);
    return updatedJoke;
}

const updateJokeVisibility = async (joke) => {
    const shouldBeShown = evaluateContentVisibility('joke', joke);
    
    if (joke.is_shown !== shouldBeShown) {
        await pool.query(
            `UPDATE jokes SET is_shown = $1 WHERE id = $2`,
            [shouldBeShown, joke.id]
        );
        joke.is_shown = shouldBeShown;
    }
}