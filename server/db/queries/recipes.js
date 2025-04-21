import { pool } from "../conn.js";
import { evaluateContentVisibility } from "../../config/contentRules.js";

export const getRecipes = async () => {
    const result = await pool.query("SELECT * FROM recipes");
    return result.rows;
};

export const getCurrentRecipe = async (category = null) => {
    // old behavior
    if (category === null) {
        const result = await pool.query("SELECT * FROM recipes WHERE recipes.date=CURRENT_DATE LIMIT 1");
        return result.rows[0];
    }
    
    // new behavior
    const query = `
        SELECT * FROM recipes 
        WHERE recipes.date=CURRENT_DATE AND recipes.category=$1 
        LIMIT 1
    `;
    const result = await pool.query(query, [category]);
    return result.rows[0] || null;
};

// get all recipes for today (one per category)
export const getAllCategoryRecipesForToday = async () => {
    const query = `
        SELECT DISTINCT ON (category) *
        FROM recipes
        WHERE date = CURRENT_DATE AND is_shown = TRUE
        ORDER BY category, score DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const getRecipesByDateRange = async (startDate, endDate = null) => {
    // If no end date provided, search only for the start date
    const actualEndDate = endDate || startDate;
    
    const query = `
        SELECT * FROM recipes 
        WHERE date >= $1 AND date <= $2 AND is_shown = TRUE
        ORDER BY date DESC, category, score DESC
    `;
    const result = await pool.query(query, [startDate, actualEndDate]);
    return result.rows;
};

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