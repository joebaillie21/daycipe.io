import React, { useEffect, useState } from 'react';

const CATEGORIES = ['math', 'physics', 'bio', 'compsci', 'chem'];

const FactOfTheDay = ({ date }) => {
  const [fact, setFact] = useState(null);
  const [baseScore, setBaseScore] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('math');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFact = async (category, date) => {
    setLoading(true);
    setError(null);
    try {
      const formatted = date.toLocaleDateString('en-CA');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/content/range?startDate=${formatted}&endDate=${formatted}`);
      if (!response.ok) throw new Error("Failed to fetch content");
      const data = await response.json();

      const fact = data.content.facts.find(f => f.category === category);
      if (!fact) throw new Error("No fact found for this category and date.");

      if (!fact.is_shown) {
        setError("This fact was removed.");
        setFact(null);
        return;
      }

      setFact(fact);
      setBaseScore(fact.score ?? 0);
      const savedVote = localStorage.getItem(`vote-fact-${fact.id}`);
      setUserVote(savedVote || null);
      console.log("ALL FACTS ON THIS DATE:", data.content.facts);
      console.log("SELECTED CATEGORY:", category);
    } catch (err) {
      setError(err.message);
      setFact(null);
      setBaseScore(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact(selectedCategory, date);
  }, [selectedCategory, date]);

  const getDisplayScore = () => {
    return baseScore;
  };

  const handleVote = async (type) => {
    if (!fact?.id) return;
  
    const previousVote = userVote;
    const oppositeType = type === "upvote" ? "downvote" : "upvote";
  
    try {
      if (previousVote === type) {
        // Undo the current vote
        const res = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/facts/${fact.id}/${oppositeType}`, {
          method: 'POST'
        });
        const data = await res.json();
        if (typeof data.newScore === "number") {
          setBaseScore(data.newScore);
        }
        localStorage.removeItem(`vote-fact-${fact.id}`);
        setUserVote(null);
      } else {
        // Undo previous vote if one exists
        if (previousVote) {
          const undoRes = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/facts/${fact.id}/${previousVote === "upvote" ? "downvote" : "upvote"}`, {
            method: 'POST'
          });
          const undoData = await undoRes.json();
          if (typeof undoData.newScore === "number") {
            setBaseScore(undoData.newScore);
          }
        }
  
        // Apply new vote
        const res = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/facts/${fact.id}/${type}`, {
          method: 'POST'
        });
        const data = await res.json();
        if (typeof data.newScore === "number") {
          setBaseScore(data.newScore);
        }
        localStorage.setItem(`vote-fact-${fact.id}`, type);
        setUserVote(type);
      }
    } catch (err) {
      console.error("Vote handling failed:", err.message);
    }
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
            <button onClick={() => handleVote("upvote")} className={`vote-btn upvote ${userVote === "upvote" ? "selected" : ""}`}>↑</button>
            <span>{getDisplayScore()}</span>
            <button onClick={() => handleVote("downvote")} className={`vote-btn downvote ${userVote === "downvote" ? "selected" : ""}`}>↓</button>
            <button onClick={() => reportContent("fact", fact.id)}>Report</button>
            <a href={fact.source} target="_blank" rel="noopener noreferrer" className="source">Source</a>
          </div>
        </>
      )}
    </div>
  );
};

export default FactOfTheDay;
