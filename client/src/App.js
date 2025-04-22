import React, { useState } from 'react';
import './App.css';
import TitleArea from './components/TitleArea';
import FactOfTheDay from './components/FactOfTheDay';
import JokeOfTheDay from './components/JokeOfTheDay';
import RecipeOfTheDay from './components/RecipeOfTheDay';

function App() {
  const [date, setDate] = useState(new Date());

  const goToPrevDay = () => {
    setDate(prev => new Date(prev.getTime() - 86400000));
  };

  const goToNextDay = () => {
    setDate(prev => new Date(prev.getTime() + 86400000));
  };

  return (
    <div className="App">
      <TitleArea currentDate={date} onPrevDay={goToPrevDay} onNextDay={goToNextDay} />
      <div className="content">
        <div className="left-column">
          <FactOfTheDay date={date} />
          <JokeOfTheDay date={date} />
        </div>
        <div className="right-column">
          <RecipeOfTheDay date={date} />
        </div>
      </div>
    </div>
  );
}

export default App;
