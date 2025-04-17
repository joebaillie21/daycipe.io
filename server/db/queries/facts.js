import { pool } from "../conn.js";
import { evaluateContentVisibility } from "../../config/contentRules.js";

export const VALID_FACT_CATEGORIES = ['math', 'physics', 'bio', 'compsci', 'chem'];

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

export const upvoteFact = async (factId) => {
    const query = `UPDATE facts SET score = score + 1 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [factId]);
    const updatedFact = result.rows[0];
    
    await updateFactVisibility(updatedFact);
    return updatedFact;
}

export const downvoteFact = async (factId) => {
    const query = `UPDATE facts SET score = score - 1 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [factId]);
    const updatedFact = result.rows[0];
    
    await updateFactVisibility(updatedFact);
    return updatedFact;
}

const updateFactVisibility = async (fact) => {
    const shouldBeShown = evaluateContentVisibility('fact', fact);
    
    if (fact.is_shown !== shouldBeShown) {
        await pool.query(
            `UPDATE facts SET is_shown = $1 WHERE id = $2`,
            [shouldBeShown, fact.id]
        );
        fact.is_shown = shouldBeShown;
    }
}

export const getCurrentFactByCategory = async (category) => {
    const result = await pool.query(
        "SELECT * FROM facts WHERE date = CURRENT_DATE AND category = $1 LIMIT 1",
        [category]
    );
    return result.rows[0];
};
