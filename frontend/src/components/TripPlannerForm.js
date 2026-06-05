import React, { useState } from "react";
import { generateItinerary } from "../api";
import { useApp } from "../context/AppContext";
import "../styles/TripPlannerForm.css";

export default function TripPlannerForm({ onTripSaved }) {
  const { saveTrip } = useApp();
  const formDataInitial = {
    destination: "",
    days: "5",
    budget: "Mid-range",
    travelStyle: "Culture",
  };
  const [formData, setFormData] = useState(formDataInitial);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestDest = (dest) => {
    setFormData((prev) => ({ ...prev, destination: dest }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination.trim()) return;

    setLoading(true);
    setItinerary(null);
    setSavedSuccess(false);

    try {
      const result = await generateItinerary(formData);
      setItinerary(result);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate itinerary. Ensure the backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!itinerary) return;
    saveTrip(itinerary);
    setSavedSuccess(true);
    if (onTripSaved) {
      setTimeout(() => {
        onTripSaved();
        setItinerary(null);
        setSavedSuccess(false);
      }, 1500);
    }
  };

  const getStyleBadge = (style) => {
    switch (style) {
      case "Culture": return "Culture & History";
      case "Adventure": return "Adventure & Active";
      case "Relaxing": return "Relaxing & Leisure";
      case "Cuisine": return "Gastronomy & Dining";
      default: return style;
    }
  };

  return (
    <div className="trip-planner-container">
      <form onSubmit={handleSubmit} className="planner-form">
        <h3>Plan Your Indian Getaway</h3>

        <div className="form-group">
          <label>Destination in India</label>
          <input
            type="text"
            name="destination"
            placeholder="e.g. Goa, Jaipur, Kerala, Manali, Udaipur..."
            value={formData.destination}
            onChange={handleChange}
            required
          />
          <div className="quick-suggestions">
            <span onClick={() => handleSuggestDest("Goa")}>Goa</span>
            <span onClick={() => handleSuggestDest("Jaipur")}>Jaipur</span>
            <span onClick={() => handleSuggestDest("Kerala")}>Kerala</span>
            <span onClick={() => handleSuggestDest("Manali")}>Manali</span>
            <span onClick={() => handleSuggestDest("Udaipur")}>Udaipur</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Duration (Days)</label>
            <input
              type="number"
              name="days"
              min="1"
              max="14"
              value={formData.days}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group half">
            <label>Budget Tier</label>
            <select name="budget" value={formData.budget} onChange={handleChange}>
              <option value="Budget">Budget (Volvo buses & hostels)</option>
              <option value="Mid-range">Moderate (Comfort cabs & stays)</option>
              <option value="Luxury">Luxury (Resorts & private guides)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Travel Preference</label>
          <select name="travelStyle" value={formData.travelStyle} onChange={handleChange}>
            <option value="Culture">Culture & History</option>
            <option value="Adventure">Adventure & Active</option>
            <option value="Relaxing">Relaxing & Leisure</option>
            <option value="Cuisine">Gastronomy & Dining</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="plan-btn">
          {loading ? "Consulting AI Travel Expert..." : "Generate Indian Itinerary & Bookings"}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="planner-loading">
          <div className="spinner"></div>
          <p>Processing custom schedule, lodging suggestions, transport, and ticket booking options in Rupees (₹)...</p>
        </div>
      )}

      {/* Display Generated Itinerary */}
      {itinerary && (
        <div className="generated-itinerary">
          <div className="itinerary-header">
            <h4>{itinerary.tripTitle || `Enchanting Getaway to ${itinerary.destination}`}</h4>
            <span className="badge">{getStyleBadge(formData.travelStyle)}</span>
          </div>

          {/* Indian Cost Summary in Rupees */}
          {itinerary.costSummary && (
            <div className="cost-summary-box" style={{ 
              backgroundColor: "#f4fcf7", 
              border: "1px solid #c2f0d5", 
              borderRadius: "8px", 
              padding: "15px", 
              margin: "15px 0" 
            }}>
              <h5 style={{ color: "#1e7e34", marginTop: 0, marginBottom: "10px", fontSize: "1em" }}>Estimated Cost Breakdown (INR)</h5>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", fontSize: "0.9em" }}>
                <div>🏨 Stay Total:</div>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>₹{itinerary.costSummary.estimatedStayTotalINR}</div>
                <div>🍲 Meals Total:</div>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>₹{itinerary.costSummary.estimatedFoodTotalINR}</div>
                <div>🎟️ Entry & Activity Tickets:</div>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>₹{itinerary.costSummary.estimatedActivitiesTotalINR}</div>
                <div>🚗 Local Transport:</div>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>₹{itinerary.costSummary.estimatedLocalTransportINR}</div>
                <div style={{ gridColumn: "span 2", borderTop: "1px solid #c2f0d5", margin: "5px 0" }}></div>
                <div style={{ fontWeight: "bold", fontSize: "1.1em", color: "#1e7e34" }}>💳 Grand Total:</div>
                <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "1.1em", color: "#1e7e34" }}>₹{itinerary.costSummary.estimatedGrandTotalINR}</div>
              </div>
              <p style={{ fontSize: "0.78em", color: "#555", margin: "10px 0 0 0" }}>
                *Ticketing integrations: {itinerary.bookingPartners?.trains} (Trains) | {itinerary.bookingPartners?.buses} (Buses) | {itinerary.bookingPartners?.flightsAndHotels} (Stays & Flights)
              </p>
            </div>
          )}

          {/* Day schedules */}
          <div className="schedule-timeline" style={{ marginTop: "20px" }}>
            {(itinerary.days || []).map((day) => (
              <div key={day.day} className="timeline-day" style={{ borderBottom: "1px dashed #eee", paddingBottom: "15px", marginBottom: "15px" }}>
                <h5 style={{ color: "#333", fontSize: "1.05em", fontWeight: "bold", margin: "10px 0" }}>
                  Day {day.day}: {day.theme}
                </h5>
                <div className="day-schedule-list" style={{ marginLeft: "10px" }}>
                  {day.schedule && day.schedule.map((item, idx) => (
                    <div key={idx} style={{ margin: "12px 0", paddingLeft: "12px", borderLeft: "2px solid #ff5a5f" }}>
                      <strong style={{ fontSize: "0.95em", color: "#222" }}>{item.time} - {item.activity}</strong> 
                      <span style={{ fontSize: "0.82em", color: "#666", display: "block" }}>📍 {item.location}</span>
                      <p style={{ margin: "4px 0", fontSize: "0.88em", color: "#555", lineHeight: "1.4" }}>{item.description}</p>
                      
                      {/* Ticket Booking Module */}
                      {item.bookingInfo && (
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          backgroundColor: "#f7f8fa", 
                          padding: "6px 12px", 
                          borderRadius: "4px", 
                          fontSize: "0.82em", 
                          marginTop: "6px" 
                        }}>
                          <span>
                            🎟️ {item.bookingInfo.bookingPlatform} : 
                            <strong style={{ marginLeft: "4px", color: "#ff5a5f" }}>
                              {item.bookingInfo.estimatedCostINR > 0 ? `₹${item.bookingInfo.estimatedCostINR}` : "Free Entry"}
                            </strong>
                          </span>
                          <a 
                            href={item.bookingInfo.bookingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              backgroundColor: "#ff5a5f", 
                              color: "white", 
                              padding: "4px 10px", 
                              borderRadius: "4px", 
                              textDecoration: "none", 
                              fontWeight: "bold",
                              fontSize: "0.92em"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#e04f54"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#ff5a5f"}
                          >
                            Book Ticket
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {day.budgetTip && (
                  <p style={{ fontStyle: "italic", fontSize: "0.82em", color: "#666", marginTop: "10px", backgroundColor: "#fff9e6", padding: "8px", borderRadius: "4px" }}>
                    💡 {day.budgetTip}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="itinerary-actions">
            <button 
              onClick={handleSave} 
              className={`save-btn ${savedSuccess ? "success" : ""}`}
              disabled={savedSuccess}
            >
              {savedSuccess ? "Trip Saved Successfully!" : "Save Trip to Dashboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
