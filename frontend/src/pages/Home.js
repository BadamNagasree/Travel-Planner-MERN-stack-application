import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "../styles/Home.css";

function Home() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className="hero"
      style={{ backgroundImage: "url('/hero-bg.png')" }}
    >
      <div className="hero-overlay">
        <span className="hero-badge">AI-Powered Travel Platform</span>
        <h1>Intelligent Itineraries, Seamless Bookings</h1>
        <p>
          Generate custom day-by-day travel plans, discover verified local insights, 
          and book destination guides on a secure, modern platform.
        </p>
        <button className="cta-btn" onClick={handleCTA}>
          {currentUser ? "Go to Dashboard" : "Start Planning Now"}
        </button>
      </div>
    </div>
  );
}

export default Home;
