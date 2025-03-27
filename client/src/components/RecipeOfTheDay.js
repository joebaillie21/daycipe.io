// RecipeOfTheDay.js
import React, { useState } from 'react';

const RecipeOfTheDay = () => {
  return (
    <div className="recipe-of-the-day">
      <div className="recipe-header">
        <h3>Recipe of the Day</h3>
        <select className='selector'>
            <option>Default</option>
            <option>Vegetarian</option>
            <option>Vegan</option>
        </select>
      </div>
      <div className="recipe-content">
        <div className="ingredients">
          <h4>Ingredients:</h4>
          <p>1 lorum</p> 
          <p>2 ipsum dolor</p>
          <p>4 sit...</p>
          <br></br>
          <p>Time: 15 mins</p>
          <select>
            <option>1 Serving</option>
            {/* Other servings */}
          </select>
        </div>
        <div className="instructions">
          <h4>Instructions:</h4>
          <p>1. Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet...</p>
          <p>2. Ut enim ad minim veniam Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet...</p>
          <p>3. Lorem ipsum dolor...</p>
        </div>
      </div>
      <div className="recipe-actions">
        <button >↑ +3 ↓</button>
        <button>Report</button>
      </div>
    </div>
  );
}

export default RecipeOfTheDay;
