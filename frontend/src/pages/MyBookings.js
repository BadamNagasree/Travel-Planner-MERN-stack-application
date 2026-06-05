import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "../styles/MyBookings.css";

export default function MyBookings() {
  const { bookings, currentUser } = useApp();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div className="loading-redirect">Access Denied. Redirecting...</div>;
  }

  return (
    <div className="bookings-container">
      <header className="bookings-header">
        <div>
          <h2>Booked Experts & Activities</h2>
          <p className="bookings-subtitle">Review local guides, private transit bookings, and reservation details.</p>
        </div>
        <button className="book-expert-cta-btn" onClick={() => navigate("/booking/new")}>
          Book Another Service
        </button>
      </header>

      {bookings.length === 0 ? (
        <div className="empty-bookings-state">
          <h4>No bookings active yet</h4>
          <p>Hire verified expert guides, private transit partners, or culinary hosts to optimize your itinerary.</p>
          <button className="book-expert-btn" onClick={() => navigate("/booking/new")}>
            Browse Local Experts
          </button>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card">
              <div className="booking-details">
                <h4>{b.expert}</h4>
                <p className="booking-meta">
                  <span>Date: <strong>{b.date}</strong></span>
                  <span>Preferred Slot: <strong>{b.slot}</strong></span>
                </p>
              </div>
              <div className="booking-status-wrapper">
                <span className={`status-badge ${b.status.toLowerCase()}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
