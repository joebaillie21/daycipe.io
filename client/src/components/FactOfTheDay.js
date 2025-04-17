import React, { useEffect, useState } from 'react';

const CATEGORIES = ['math', 'physics', 'bio', 'compsci', 'chem'];

const FactOfTheDay = () => {
  const [fact, setFact] = useState(null);
  const [baseScore, setBaseScore] = useState(0); // ← this never changes after fetch
  const [userVote, setUserVote] = useState(null); // 'upvote', 'downvote', or null
  const [selectedCategory, setSelectedCategory] = useState('math');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFact = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/facts/today/${category}`);
      if (!response.ok) throw new Error("Failed to fetch fact");
      const data = await response.json();
      setFact(data);
      setBaseScore(data.score ?? 0);
      const savedVote = localStorage.getItem(`vote-fact-${data.id}`);
      setUserVote(savedVote || null);
    } catch (err) {
      setError(err.message);
      setFact(null);
      setBaseScore(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact(selectedCategory);
  }, [selectedCategory]);

  const getDisplayScore = () => {
    if (userVote === 'upvote') return baseScore + 1;
    if (userVote === 'downvote') return baseScore - 1;
    return baseScore;
  };

  const updateVoteOnServer = async (type) => {
    if (!fact?.id) return;
    const endpoint = `http://localhost:3001/api/facts/${fact.id}/${type}`;
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleVote = async (type) => {
    if (!fact?.id) return;

    const previousVote = userVote;
    let newVote = null;

    if (previousVote === type) {
      newVote = null;
    } else {
      newVote = type;
    }

    setUserVote(newVote);

    if (newVote) {
      localStorage.setItem(`vote-fact-${fact.id}`, newVote);
      await updateVoteOnServer(newVote);
    } else {
      localStorage.removeItem(`vote-fact-${fact.id}`);
      // Optional: hit an "undo" route
    }
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
    <div className="fact-of-the-day">
      <div className="fact-header">
        <h3>Fact of the Day</h3>
        <select
          className="selector"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {fact && (
        <>
          <p>{fact.content}</p>
          <div className="fact-actions">
            <button
              onClick={() => handleVote("upvote")}
              className={`vote-btn upvote ${userVote === "upvote" ? "selected" : ""}`}
            >
              ↑
            </button>
            <span>{getDisplayScore()}</span>
            <button
              onClick={() => handleVote("downvote")}
              className={`vote-btn downvote ${userVote === "downvote" ? "selected" : ""}`}
            >
              ↓
            </button>
            <button onClick={() => reportContent("fact", fact.id)}>Report</button>
            <a
              href={fact.source}
              target="_blank"
              rel="noopener noreferrer"
              className="source"
            >
              Source
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default FactOfTheDay;
