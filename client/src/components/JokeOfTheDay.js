// JokeOfTheDay.js
import React, { useState } from 'react';

const JokeOfTheDay = () => {
  const [jokePage, setJokePage] = useState(1);

  return (
    <div className="joke-of-the-day">
        <button className='joke-chevron'>{'<'}</button>
        <div>
            <h3>Joke of the Day</h3>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit... 
            </p>
            <div className="joke-actions">
                <button >↑ +12 ↓</button>
                <button>Report</button>
            </div>
        </div>
        <button className='joke-chevron'>{'>'}</button>
    </div>
  );
}

export default JokeOfTheDay;
