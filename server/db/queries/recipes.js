import { pool } from "../conn.js";
import { evaluateContentVisibility } from "../../config/contentRules.js";

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

export const upvoteRecipe = async (recipeId) => {
    const query = `UPDATE recipes SET score = score + 1 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [recipeId]);
    const updatedRecipe = result.rows[0];
    
    await updateRecipeVisibility(updatedRecipe);
    return updatedRecipe;
}

export const downvoteRecipe = async (recipeId) => {
    const query = `UPDATE recipes SET score = score - 1 WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [recipeId]);
    const updatedRecipe = result.rows[0];
    
    await updateRecipeVisibility(updatedRecipe);
    return updatedRecipe;
}

// More flexible function to update visibility based on configurable rules
const updateRecipeVisibility = async (recipe) => {
    const shouldBeShown = evaluateContentVisibility('recipe', recipe);
    
    if (recipe.is_shown !== shouldBeShown) {
        await pool.query(
            `UPDATE recipes SET is_shown = $1 WHERE id = $2`,
            [shouldBeShown, recipe.id]
        );
        recipe.is_shown = shouldBeShown;
    }
}