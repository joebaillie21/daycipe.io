import React from 'react';
import { format } from 'date-fns';

const TitleArea = ({ currentDate, onPrevDay, onNextDay }) => {
  return (
    <div className="title-area">
      <button className="chevron-left" onClick={onPrevDay}>{'<'}</button>
      <div className="date">
        <span>{format(currentDate, 'MMM ')}</span>
        <span>{format(currentDate, 'd')}</span>
      </div>
      <button className="chevron-right" onClick={onNextDay}>{'>'}</button>
    </div>
  );
};

export default TitleArea;
