import { pool } from "../conn.js";

export const getRecipes = async () => {
    const result = await pool.query("SELECT * FROM recipes");
    return result.rows;
};

export const getCurrentRecipe = async () => {
    const result = await pool.query("SELECT * FROM recipes WHERE recipes.date=CURRENT_DATE LIMIT 3");
    return result.rows[0];
}
