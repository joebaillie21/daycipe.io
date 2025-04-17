import React, { useState, useEffect } from 'react';

const JokeOfTheDay = () => {
  const [jokes, setJokes] = useState([]);
  const [jokePage, setJokePage] = useState(0);
  const [baseScores, setBaseScores] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === Fetch jokes on mount ===
  useEffect(() => {
    const fetchJokes = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/jokes/today");
        if (!response.ok) throw new Error("Failed to fetch jokes");
        const data = await response.json();
        const jokesArray = Array.isArray(data) ? data : [data];
        console.log(jokesArray)

        // Initialize scores and votes
        const scores = {};
        const votes = {};
        for (const joke of jokesArray) {
          scores[joke.id] = joke.score ?? 0;
          votes[joke.id] = localStorage.getItem(`vote-joke-${joke.id}`) || null;
        }

        setJokes(jokesArray);
        setBaseScores(scores);
        setUserVotes(votes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJokes();
  }, []);

  const currentJoke = jokes[jokePage];
  const currentId = currentJoke?.id;
  const baseScore = baseScores[currentId] ?? 0;
  const userVote = userVotes[currentId] ?? null;

  const displayScore = () => {
    if (userVote === 'upvote') return baseScore + 1;
    if (userVote === 'downvote') return baseScore - 1;
    return baseScore;
  };

  const updateVoteOnServer = async (type) => {
    try {
      await fetch(`http://localhost:3001/api/jokes/${currentId}/${type}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error(`Failed to ${type} joke:`, err.message);
    }
  };

  const handleVote = async (type) => {
    if (!currentId) return;

    const previousVote = userVotes[currentId];
    let newVote = null;

    if (previousVote === type) {
      newVote = null;
    } else {
      newVote = type;
    }

    setUserVotes(prev => ({ ...prev, [currentId]: newVote }));

    if (newVote) {
      localStorage.setItem(`vote-joke-${currentId}`, newVote);
      await updateVoteOnServer(newVote);
    } else {
      localStorage.removeItem(`vote-joke-${currentId}`);
      // Optional: call undo endpoint if added
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
      await fetch("http://localhost:3001/api/reports/create", {
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
        {!loading && !error && currentJoke && (
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
              <button onClick={() => reportContent("joke", currentJoke.id)}>Report</button>
            </div>
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
