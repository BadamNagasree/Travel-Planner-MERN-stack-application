import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import BookingForm from "../components/BookingForm";
import "../styles/BookingPage.css";

export default function BookingPage() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  // Route Guard
  React.useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div className="loading-redirect">Redirecting to login...</div>;
  }

  return (
    <div className="booking-page-container">
      <div className="booking-form-wrapper">
        <BookingForm />
      </div>
    </div>
  );
}
