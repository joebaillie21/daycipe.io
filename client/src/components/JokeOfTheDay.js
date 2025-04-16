import React, { useState, useEffect } from 'react';

const JokeOfTheDay = () => {
  const [jokes, setJokes] = useState([]);
  const [jokePage, setJokePage] = useState(0); // Which joke to show
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJokes = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/jokes/today");
        if (!response.ok) throw new Error("Failed to fetch jokes");
        const data = await response.json();
        setJokes(Array.isArray(data) ? data : [data]); // force to array if single
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJokes();
  }, []);

  const nextJoke = () => setJokePage((prev) => (prev + 1) % jokes.length);
  const prevJoke = () => setJokePage((prev) => (prev - 1 + jokes.length) % jokes.length);

  const currentJoke = jokes[jokePage];

  return (
    <div className="joke-of-the-day">
      <button className="joke-chevron" onClick={prevJoke} disabled={jokes.length <= 1}>{'<'}</button>
      <div>
        <h3>Joke of the Day</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && currentJoke && (
          <>
            <p>{currentJoke.content}</p>
            <div className="joke-actions">
              <button>↑ +12 ↓</button>
              <button>Report</button>
            </div>
          </>
        )}
      </div>
      <button className="joke-chevron" onClick={nextJoke} disabled={jokes.length <= 1}>{'>'}</button>

    </div>
  );
};

export default JokeOfTheDay;
