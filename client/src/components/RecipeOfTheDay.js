import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  'default',
  'veganism',
  'vegetarianism',
  'lactose_intolerance',
  'gluten_intolerance',
  'kosher'
];

const RecipeOfTheDay = () => {
  const [selectedCategory, setSelectedCategory] = useState('default');
  const [recipe, setRecipe] = useState(null);
  const [baseScore, setBaseScore] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [servingSize, setServingSize] = useState(1);
  const [defaultServing, setDefaultServing] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipe = async (category) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/recipes/today?category=${category}`);
      if (!response.ok) throw new Error("Failed to fetch recipe");
      const data = await response.json();
  
      data.content = JSON.parse(data.content); // ✅ fix here
  
      setRecipe(data);
      setBaseScore(data.score ?? 0);
      setUserVote(localStorage.getItem(`vote-recipe-${data.id}`) || null);
      const servings = data.content?.serving_size ?? 1;
      setServingSize(servings);
      setDefaultServing(servings);
    } catch (err) {
      setError(err.message);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe(selectedCategory);
  }, [selectedCategory]);

  const displayScore = () => {
    if (userVote === 'upvote') return baseScore + 1;
    if (userVote === 'downvote') return baseScore - 1;
    return baseScore;
  };

  const updateVoteOnServer = async (type) => {
    try {
      await fetch(`http://localhost:3001/api/recipes/${recipe.id}/${type}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error(`Failed to ${type} recipe:`, err.message);
    }
  };

  const handleVote = async (type) => {
    if (!recipe?.id) return;

    const previousVote = userVote;
    const newVote = previousVote === type ? null : type;

    setUserVote(newVote);
    if (newVote) {
      localStorage.setItem(`vote-recipe-${recipe.id}`, newVote);
      await updateVoteOnServer(newVote);
    } else {
      localStorage.removeItem(`vote-recipe-${recipe.id}`);
    }
  };

  const handleServingChange = (e) => {
    setServingSize(Number(e.target.value));
  };

  const scaleIngredient = (amount) => {
    return ((amount * servingSize) / defaultServing).toFixed(2).replace(/\.00$/, '');
  };

  const reportContent = async (type, id) => {
    const reason = prompt("Why are you reporting this?");
    if (!reason) return;
  
    try {
      await fetch("http://localhost:3001/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: type,
          content_id: id,
          substance_of_report: reason
        }),
      });
      alert("Thanks for reporting. Our team will review it shortly.");
    } catch (err) {
      console.error("Failed to report content:", err);
      alert("Failed to submit report.");
    }
  };
  

  return (
    <div className="recipe-of-the-day">
      <div className="recipe-header">
        <h3>Recipe of the Day</h3>
        <select
          className="selector"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && recipe && (
        <>
          <h2>{recipe.content?.title}</h2>
          <p><em>{recipe.content?.description}</em></p>

          <div className="recipe-content">
            <div className="ingredients">
              <h4>Ingredients (for {servingSize} serving{servingSize > 1 ? 's' : ''}):</h4>
              <select value={servingSize} onChange={handleServingChange}>
                {[1, 2, 4, 6, 8].map((s) => (
                  <option key={s} value={s}>{s} Serving{s > 1 ? 's' : ''}</option>
                ))}
              </select>
              <ul>
                {recipe.content?.ingredients &&
                  Object.entries(recipe.content.ingredients).map(([name, obj]) => (
                    <li key={name}>
                      {scaleIngredient(obj.amount)} {obj.unit} {name}
                      {obj.notes && <span> ({obj.notes})</span>}
                    </li>
                  ))}
              </ul>
              {recipe.content?.cook_time && (
                <p><strong>Cook Time:</strong> {recipe.content.cook_time}</p>
              )}
            </div>

            <div className="instructions">
              <h4>Instructions:</h4>
              <ol>
                {(recipe.content?.instructions || []).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="recipe-actions">
            <button
              onClick={() => handleVote("upvote")}
              className={`vote-btn upvote ${userVote === "upvote" ? "selected" : ""}`}
            >
              ↑
            </button>
            <span>{displayScore()}</span>
            <button
              onClick={() => handleVote("downvote")}
              className={`vote-btn downvote ${userVote === "downvote" ? "selected" : ""}`}
            >
              ↓
            </button>
            <button onClick={() => reportContent("recipe", recipe.id)}>Report</button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecipeOfTheDay;
