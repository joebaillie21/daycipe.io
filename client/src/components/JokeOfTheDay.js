import React, { useState, useEffect } from 'react';

const JokeOfTheDay = ({ date }) => {
  const [jokes, setJokes] = useState([]);
  const [jokePage, setJokePage] = useState(0);
  const [baseScores, setBaseScores] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJokes = async () => {
      setLoading(true);
      try {
        const formatted = date.toLocaleDateString('en-CA');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/content/range?startDate=${formatted}&endDate=${formatted}`);
        if (!response.ok) throw new Error("Failed to fetch content");

        const data = await response.json();
        const jokesArray = Array.isArray(data.content.jokes) ? data.content.jokes : [data.content.jokes];

        const visibleJokes = jokesArray.filter(joke => joke.is_shown);

        const scores = {};
        const votes = {};
        for (const joke of visibleJokes) {
          scores[joke.id] = joke.score ?? 0;
          votes[joke.id] = localStorage.getItem(`vote-joke-${joke.id}`) || null;
        }

        setJokes(visibleJokes);
        setBaseScores(scores);
        setUserVotes(votes);
        setJokePage(0);
      } catch (err) {
        setError(err.message);
        setJokes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJokes();
  }, [date]);

  const currentJoke = jokes[jokePage];
  const currentId = currentJoke?.id;
  const baseScore = baseScores[currentId] ?? 0;
  const userVote = userVotes[currentId] ?? null;

  const displayScore = () => baseScore;

  const handleVote = async (type) => {
    if (!currentId) return;
  
    const previousVote = userVotes[currentId];
    const oppositeType = type === "upvote" ? "downvote" : "upvote";
  
    try {
      if (previousVote === type) {
        // User clicked the same vote → undo it
        const res = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/jokes/${currentId}/${oppositeType}`, {
          method: 'POST'
        });
        const data = await res.json();
        setUserVotes(prev => ({ ...prev, [currentId]: null }));
        setBaseScores(prev => ({ ...prev, [currentId]: data.newScore }));
        localStorage.removeItem(`vote-joke-${currentId}`);
      } else {
        // Undo previous vote if there was one
        if (previousVote) {
          const undoRes = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/jokes/${currentId}/${previousVote === "upvote" ? "downvote" : "upvote"}`, {
            method: 'POST'
          });
          const undoData = await undoRes.json();
          setBaseScores(prev => ({ ...prev, [currentId]: undoData.newScore }));
        }
  
        // Apply the new vote
        const res = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/jokes/${currentId}/${type}`, {
          method: 'POST'
        });
        const data = await res.json();
  
        setUserVotes(prev => ({ ...prev, [currentId]: type }));
        setBaseScores(prev => ({ ...prev, [currentId]: data.newScore }));
        localStorage.setItem(`vote-joke-${currentId}`, type);
      }
    } catch (err) {
      console.error("Vote handling failed:", err.message);
    }
  };  

  const nextJoke = () => {
    setJokePage((prev) => (prev + 1) % jokes.length);
  };

  const prevJoke = () => {
    setJokePage((prev) => (prev - 1 + jokes.length) % jokes.length);
  };

  const reportContent = async (type, id) => {
    const reason = prompt("Why are you reporting this?");
    if (!reason) return;
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/reports/create`, {
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
    <div className="joke-of-the-day">
      <button className="joke-chevron" onClick={prevJoke} disabled={jokes.length <= 1}>
        {'<'}
      </button>
      <div>
        <h3>Joke of the Day</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && (
          <>
            {error && <p className="error">{error}</p>}
            {!error && currentJoke ? (
              <>
                <p>{currentJoke.content}</p>
                <div className="joke-actions">
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
                  <button onClick={() => reportContent("joke", currentId)}>Report</button>
                </div>
              </>
            ) : !error && (
              <p>No joke found for this date.</p>
            )}
          </>
        )}
      </div>
      <button className="joke-chevron" onClick={nextJoke} disabled={jokes.length <= 1}>
        {'>'}
      </button>
    </div>
  );
};

export default JokeOfTheDay;
