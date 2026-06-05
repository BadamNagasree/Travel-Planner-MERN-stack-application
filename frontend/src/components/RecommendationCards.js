import React, { useState, useEffect } from "react";
import { getRecommendations } from "../api";
import "../styles/RecommendationCards.css";

export default function RecommendationCards({ prefs }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRecommendations(prefs)
      .then((data) => {
        setRecs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [prefs]);

  if (loading) {
    return (
      <div className="sidebar-recs-loading">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      {recs.map((rec, i) => (
        <div key={i} className="rec-card">
          <p>{rec.generated_text}</p>
        </div>
      ))}
    </div>
  );
}
