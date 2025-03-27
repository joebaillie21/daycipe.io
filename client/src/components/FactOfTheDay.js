// FactOfTheDay.js
import React, { useState } from 'react';

const FactOfTheDay = () => {

  return (
    <div className="fact-of-the-day">
      <div className="fact-header">
        <h3>Fact of the Day</h3>
        <select className='selector'>
          <option>Science</option>
          <option>Math</option>
          <option>History</option>
          {/* Other categories */}
        </select>
      </div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit... Lorem ipsum dolor sit amet, consectetur adipiscing elit... Lorem ipsum dolor sit amet, consectetur adipiscing elit... Lorem ipsum dolor sit amet, consectetur adipiscing elit... Lorem ipsum dolor sit amet, consectetur adipiscing elit...
      </p>
      <div className="fact-actions">
        <button >↑ +23 ↓</button>
        <button>Report</button>
        <button className="source">Source</button>
      </div>
    </div>
  );
}

export default FactOfTheDay;
