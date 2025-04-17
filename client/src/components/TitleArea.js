// TitleArea.js
import React from 'react';

const TitleArea = () => {
  return (
    <div className="title-area">
      <button className="chevron-left">{'<'}</button>
      <div className="date">
        <span>Jan </span>
        <span>15</span>
      </div>
      <button className="chevron-right">{'>'}</button>
    </div>
  );
}

export default TitleArea;
