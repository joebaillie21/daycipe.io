import { pool } from "../conn.js";

export const getRecipes = async () => {
    const result = await pool.query("SELECT * FROM recipes");
    return result.rows;
};

export const getCurrentRecipe = async () => {
    const result = await pool.query("SELECT * FROM recipes WHERE recipes.date=CURRENT_DATE LIMIT 3");
    return result.rows[0];
}

export const createRecipe = async (recipeData) => {
    const query = `INSERT INTO recipes (date, content, category) VALUES ($1, $2, $3) RETURNING id`;
    const values = [
        recipeData.date,
        recipeData.content,
        recipeData.category
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
}
