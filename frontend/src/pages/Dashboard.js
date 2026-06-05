import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import RecommendationCards from "../components/RecommendationCards";
import TripPlannerForm from "../components/TripPlannerForm";
import TicketBookingSystem from "../components/TicketBookingSystem";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { currentUser, savedTrips, deleteTrip } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("planner"); // planner vs transit
  const [showPlanner, setShowPlanner] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState(null);

  // Auth Guard
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div className="loading-redirect">Access Denied. Redirecting...</div>;
  }

  const toggleExpandTrip = (id) => {
    setExpandedTripId(expandedTripId === id ? null : id);
  };

  const handleTripSaved = () => {
    setShowPlanner(false);
  };

  const dashboardPrefs = { budget: 1500, days: 7, cuisine: "Mediterranean" };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Welcome Back, {currentUser.name}</h1>
          <p>Access your saved Indian itineraries, generate custom holiday routes, and book transit tickets instantly.</p>
        </div>
        {activeTab === "planner" && (
          <button className="plan-new-cta-btn" onClick={() => setShowPlanner(!showPlanner)}>
            {showPlanner ? "Hide Planner Panel" : "Plan a New Indian Trip"}
          </button>
        )}
      </header>

      {/* Tab Navigation Menu */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "planner" ? "active" : ""}`}
          onClick={() => setActiveTab("planner")}
        >
          AI Trip Planner
        </button>
        <button
          className={`tab-btn ${activeTab === "transit" ? "active" : ""}`}
          onClick={() => setActiveTab("transit")}
        >
          Express Transit Booking
        </button>
      </div>

      {/* Planner Panel */}
      {activeTab === "planner" && showPlanner && (
        <section className="planner-drawer">
          <TripPlannerForm onTripSaved={handleTripSaved} />
        </section>
      )}

      {/* Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Switch between Trip Planner Lists and Live Transit Booking */}
        <main className="main-content-section">
          {activeTab === "planner" ? (
            <div className="saved-trips-section">
              <div className="section-title-row">
                <h3>Saved Indian Itineraries</h3>
                <span className="count-badge">{savedTrips.length} Saved</span>
              </div>

              {savedTrips.length === 0 ? (
                <div className="empty-trips-state">
                  <h4>No itineraries planned yet</h4>
                  <p>Utilize our intelligent domestic travel planner to generate customized day-by-day routes and booking links for your chosen Indian destination.</p>
                  {!showPlanner && (
                    <button className="start-planning-btn" onClick={() => setShowPlanner(true)}>
                      Plan a Trip Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="saved-trips-list">
                  {savedTrips.map((trip) => {
                    const tripId = trip._id || trip.id;
                    const isExpanded = expandedTripId === tripId;
                    
                    // Support both Mongoose rich itinerary payload and legacy simulated payloads
                    const hasRichItinerary = !!trip.itinerary;
                    const itineraryDetails = hasRichItinerary ? trip.itinerary : null;
                    
                    // Get trip variables
                    const destination = trip.destination;
                    const duration = trip.duration || trip.days;
                    const budget = trip.budget;
                    const styleFocus = trip.travelStyle || (trip.preferences && trip.preferences.join(", "));

                    return (
                      <div key={tripId} className={`trip-card ${isExpanded ? "expanded" : ""}`}>
                        <div className="trip-card-summary" onClick={() => toggleExpandTrip(tripId)}>
                          <div className="trip-main-info">
                            <h4>{itineraryDetails?.tripTitle || `Trip to ${destination}`}</h4>
                            <p className="trip-meta">
                              <span>📍 {destination}</span>
                              <span>⏱️ {duration} Days</span>
                              <span>💰 {budget}</span>
                              {styleFocus && <span>⭐ {styleFocus}</span>}
                            </p>
                          </div>
                          <div className="trip-actions-toggle">
                            <button className="expand-toggle-btn">
                              {isExpanded ? "Hide Details" : "View Itinerary & Bookings"}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="trip-card-details">
                            {hasRichItinerary ? (
                              /* NEW RICH INDIAN ITINERARY RENDER ENGINE */
                              <div className="rich-trip-details">
                                <div className="details-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                  <div>
                                    <p style={{ margin: "2px 0" }}><strong>Indian Ticketing Partners:</strong> {itineraryDetails.bookingPartners?.trains} (trains) | {itineraryDetails.bookingPartners?.buses} (buses)</p>
                                  </div>
                                  <button className="delete-trip-btn" onClick={(e) => { e.stopPropagation(); deleteTrip(tripId); }}>
                                    Delete Itinerary
                                  </button>
                                </div>

                                {/* Dynamic Cost Summary Table in Rupees */}
                                {itineraryDetails.costSummary && (
                                  <div className="dashboard-cost-summary" style={{
                                    backgroundColor: "#f4fcf7",
                                    border: "1px solid #c2f0d5",
                                    borderRadius: "8px",
                                    padding: "12px 15px",
                                    marginBottom: "20px",
                                    fontSize: "0.9em"
                                  }}>
                                    <span style={{ fontWeight: "bold", color: "#28a745", display: "block", marginBottom: "6px" }}>₹ Trip Budget Estimate Breakdown:</span>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                                      <div>🏨 Stays: <strong>₹{itineraryDetails.costSummary.estimatedStayTotalINR}</strong></div>
                                      <div>🍲 Meals: <strong>₹{itineraryDetails.costSummary.estimatedFoodTotalINR}</strong></div>
                                      <div>🎟️ Entry tickets: <strong>₹{itineraryDetails.costSummary.estimatedActivitiesTotalINR}</strong></div>
                                      <div>🚗 Cabs/Transit: <strong>₹{itineraryDetails.costSummary.estimatedLocalTransportINR}</strong></div>
                                    </div>
                                    <div style={{ borderTop: "1px solid #c2f0d5", marginTop: "8px", paddingTop: "8px", fontWeight: "bold", color: "#1e7e34", fontSize: "1.05em" }}>
                                      Grand Estimated Total (INR): ₹{itineraryDetails.costSummary.estimatedGrandTotalINR}
                                    </div>
                                  </div>
                                )}

                                {/* Daily Schedules & Direct Booking buttons */}
                                <div className="details-schedule">
                                  {(itineraryDetails.days || []).map((day) => (
                                    <div key={day.day} className="details-day" style={{ borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" }}>
                                      <h5 style={{ fontSize: "1em", color: "#333", marginBottom: "8px" }}>Day {day.day}: {day.theme}</h5>
                                      <div style={{ paddingLeft: "10px" }}>
                                        {day.schedule && day.schedule.map((item, idx) => (
                                          <div key={idx} style={{ marginBottom: "10px", paddingLeft: "8px", borderLeft: "2px solid #ff5a5f" }}>
                                            <span style={{ fontWeight: "bold", color: "#444", fontSize: "0.9em" }}>{item.time} - {item.activity}</span>
                                            <span style={{ fontSize: "0.8em", color: "#777", display: "block" }}>📍 {item.location}</span>
                                            <p style={{ margin: "2px 0 6px 0", fontSize: "0.85em", color: "#666" }}>{item.description}</p>
                                            
                                            {/* Indian Ticketing link integration */}
                                            {item.bookingInfo && (
                                              <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                backgroundColor: "#f7f8fa",
                                                padding: "4px 10px",
                                                borderRadius: "4px",
                                                fontSize: "0.8em"
                                              }}>
                                                <span>
                                                  🎟️ Book via {item.bookingInfo.bookingPlatform} : 
                                                  <strong style={{ color: "#ff5a5f", marginLeft: "4px" }}>
                                                    {item.bookingInfo.estimatedCostINR > 0 ? `₹${item.bookingInfo.estimatedCostINR}` : "Free"}
                                                  </strong>
                                                </span>
                                                <a 
                                                  href={item.bookingInfo.bookingUrl} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  style={{
                                                    backgroundColor: "#ff5a5f",
                                                    color: "white",
                                                    textDecoration: "none",
                                                    padding: "2px 8px",
                                                    borderRadius: "3px",
                                                    fontWeight: "bold",
                                                    fontSize: "0.9em"
                                                  }}
                                                >
                                                  Book Ticket
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      {day.budgetTip && (
                                        <p style={{ fontStyle: "italic", fontSize: "0.8em", color: "#777", margin: "8px 0 0 10px" }}>💡 {day.budgetTip}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              /* LEGACY/MOCK ITINERARY RENDER ENGINE FOR RESILIENCE */
                              <div className="legacy-trip-details">
                                <div className="details-header">
                                  <p><strong>Stay Suggestion:</strong> {trip.stay}</p>
                                  <p><strong>Estimated Cost:</strong> {trip.estimatedCost}</p>
                                  <button className="delete-trip-btn" onClick={(e) => { e.stopPropagation(); deleteTrip(tripId); }}>
                                    Delete Itinerary
                                  </button>
                                </div>

                                <div className="details-schedule">
                                  {trip.daysSchedule && trip.daysSchedule.map((day) => (
                                    <div key={day.day} className="details-day">
                                      <h5>Day {day.day}</h5>
                                      <ul>
                                        <li><strong>Morning:</strong> {day.morning}</li>
                                        <li><strong>Afternoon:</strong> {day.afternoon}</li>
                                        <li><strong>Evening:</strong> {day.evening}</li>
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="transit-booking-section">
              <div className="section-title-row">
                <h3>Transit & Connections Booking</h3>
              </div>
              <TicketBookingSystem />
            </div>
          )}
        </main>

        {/* Right Column: AI Suggestions */}
        <aside className="recommendations-sidebar">
          <h3>Seasonal Recommendations</h3>
          <p className="sidebar-description">Handpicked destinations and trending highlights aligned with popular itineraries.</p>
          <RecommendationCards prefs={dashboardPrefs} />
        </aside>
      </div>
    </div>
  );
}
