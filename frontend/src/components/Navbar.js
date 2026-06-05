import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "../styles/Navbar.css";

// Import logo from src
import logo from "../logo.png";

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="TravelAI Logo" className="logo-img" />
        <span className="site-name">Plan Your Trip</span>
      </div>

      <div className="links-container">
        <Link to="/" className="nav-link">Home</Link>
        {currentUser ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/my-bookings" className="nav-link">My Bookings</Link>
            <span className="user-greeting">Welcome, {currentUser.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <Link to="/login" className="login-link-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}
