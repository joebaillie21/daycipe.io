import React, { useState, useEffect } from 'react';

const RecipeOfTheDay = () => {
  const [recipes, setRecipes] = useState([]);
  const [recipePage, setRecipePage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/recipes/today");
        if (!response.ok) throw new Error("Failed to fetch recipes");
        const data = await response.json();
        setRecipes(Array.isArray(data) ? data : [data]); // wrap in array if not
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, []);

  const nextRecipe = () => setRecipePage((prev) => (prev + 1) % recipes.length);
  const prevRecipe = () => setRecipePage((prev) => (prev - 1 + recipes.length) % recipes.length);

  const current = recipes[recipePage];

  return (
    <div className="recipe-of-the-day">
      <div className="recipe-header">
        <h3>Recipe of the Day</h3>
        <select className='selector' disabled>
          <option>Default</option>
          <option>Vegetarian</option>
          <option>Vegan</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && current && (
        <div className="recipe-content">
          <div className="ingredients">
            <h4>Ingredients:</h4>
            {(current.ingredients || ["No ingredients listed."]).map((item, i) => (
              <p key={i}>{item}</p>
            ))}
            {current.time && (
              <>
                <br />
                <p>Time: {current.time}</p>
              </>
            )}
            <select>
              <option>1 Serving</option>
              {/* You can add logic here for servings later */}
            </select>
          </div>
          <div className="instructions">
            <h4>Instructions:</h4>
            {(current.instructions || ["No instructions provided."]).map((step, i) => (
              <p key={i}>{i + 1}. {step}</p>
            ))}
          </div>
        </div>
      )}

      <div className="recipe-actions">
        <button onClick={prevRecipe} disabled={recipes.length <= 1}>{'<'}</button>
        <button>↑ +3 ↓</button>
        <button>Report</button>
        <button onClick={nextRecipe} disabled={recipes.length <= 1}>{'>'}</button>
      </div>
    </div>
  );
};

export default RecipeOfTheDay;
