import React, { useEffect, useState } from 'react';

const FactOfTheDay = () => {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFact = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/facts/today");
        if (!response.ok) throw new Error("Failed to fetch fact");
        const data = await response.json();
        setFact(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFact();
  }, []);

  return (
    <div className="fact-of-the-day">
      <div className="fact-header">
        <h3>Fact of the Day</h3>
        <select className='selector' disabled>
          <option>Science</option>
          <option>Math</option>
          <option>History</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {fact && (
        <>
          <p>{fact.content}</p>
          <div className="fact-actions">
            <button>↑ +23 ↓</button>
            <button>Report</button>
            <a href={fact.source} target="_blank" rel="noopener noreferrer" className="source">Source</a>
          </div>
        </>
      )}
    </div>
  );
};

export default FactOfTheDay;
