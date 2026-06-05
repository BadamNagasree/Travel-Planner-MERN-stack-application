import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "../styles/BookingForm.css";

export default function BookingForm() {
  const { addBooking } = useApp();
  const navigate = useNavigate();

  const [expert, setExpert] = useState("Alpine Tour Guide (Switzerland)");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!date) {
      setError("Please select a booking date.");
      return;
    }
    if (!slot) {
      setError("Please select a preferred slot.");
      return;
    }

    addBooking(expert, date, slot);
    setSuccess(true);

    setTimeout(() => {
      navigate("/my-bookings");
    }, 1000);
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h3>Reserve Destination Experts</h3>
      <p className="form-info">Secure verified local guides, drivers, and hosts for your itinerary.</p>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Booking confirmed. Redirecting to your panel...</p>}

      <div className="form-group">
        <label>Select Service / Guide</label>
        <select value={expert} onChange={(e) => setExpert(e.target.value)} disabled={success}>
          <option value="Alpine Tour Guide (Switzerland)">Alpine Tour Guide (Switzerland)</option>
          <option value="Grand Canal Gondola (Venice)">Grand Canal Gondola (Venice)</option>
          <option value="Tokyo Foodie Expert Guide (Japan)">Tokyo Foodie Expert Guide (Japan)</option>
          <option value="Parisian Fine Art Photographer (France)">Parisian Fine Art Photographer (France)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          min={new Date().toISOString().split("T")[0]}
          disabled={success}
          required
        />
      </div>

      <div className="form-group">
        <label>Select Time Slot</label>
        <select value={slot} onChange={(e) => setSlot(e.target.value)} disabled={success}>
          <option value="">-- Select Time --</option>
          <option value="10AM">10:00 AM (Morning)</option>
          <option value="2PM">02:00 PM (Afternoon)</option>
          <option value="6PM">06:00 PM (Evening)</option>
        </select>
      </div>

      <button type="submit" className="booking-submit-btn" disabled={success}>
        {success ? "Booking Confirmed" : "Confirm Booking"}
      </button>
    </form>
  );
}
