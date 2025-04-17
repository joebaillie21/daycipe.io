// App.js
import React from 'react';
import './App.css';
import TitleArea from './components/TitleArea';
import FactOfTheDay from './components/FactOfTheDay';
import JokeOfTheDay from './components/JokeOfTheDay';
import RecipeOfTheDay from './components/RecipeOfTheDay';

function App() {
  return (
    <div className="App">
      <TitleArea />
      <div className="content">
        <div className="left-column">
          <FactOfTheDay />
          <JokeOfTheDay />
        </div>
        <div className="right-column">
          <RecipeOfTheDay />
        </div>
      </div>
    </div>
  );
}

export default App;
