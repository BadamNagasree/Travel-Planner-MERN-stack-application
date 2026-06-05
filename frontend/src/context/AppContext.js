import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserTrips, saveTripToDB, deleteTripFromDB } from "../api";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("travel_planner_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Saved Trips State (now backed by MongoDB)
  const [savedTrips, setSavedTrips] = useState([]);

  // Bookings State (Local mock for transit demonstration)
  const [bookings, setBookings] = useState(() => {
    const storedBookings = localStorage.getItem("travel_planner_bookings");
    return storedBookings ? JSON.parse(storedBookings) : [
      { id: 1, expert: "Rajdhani Express AC Coach ticket", date: "2026-07-12", slot: "Delhi to Mumbai", status: "Confirmed" },
      { id: 2, expert: "Goa Beach Shack Booking (Calangute)", date: "2026-08-05", slot: "Boutique Homestay", status: "Confirmed" }
    ];
  });

  // Persist local mock bookings
  useEffect(() => {
    localStorage.setItem("travel_planner_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Load saved trips from MongoDB whenever the authenticated user changes or starts up
  useEffect(() => {
    if (currentUser) {
      const loadUserTrips = async () => {
        try {
          const trips = await fetchUserTrips();
          setSavedTrips(trips);
        } catch (error) {
          console.error("Error loading user trips from MongoDB:", error.message);
        }
      };
      loadUserTrips();
    } else {
      setSavedTrips([]);
    }
  }, [currentUser]);

  // Real Login handler
  const login = async (email, password) => {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Invalid credentials. Please try again.");
    }

    // Save JWT and user details
    localStorage.setItem("travel_planner_token", data.token);
    localStorage.setItem("travel_planner_user", JSON.stringify(data.user));
    setCurrentUser(data.user);
    
    return data.user;
  };

  // Real Signup handler
  const signup = async (name, email, password) => {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Registration failed. Email might already be registered.");
    }

    // Save JWT and user details
    localStorage.setItem("travel_planner_token", data.token);
    localStorage.setItem("travel_planner_user", JSON.stringify(data.user));
    setCurrentUser(data.user);

    return data.user;
  };

  // Real Logout handler
  const logout = () => {
    localStorage.removeItem("travel_planner_token");
    localStorage.removeItem("travel_planner_user");
    setCurrentUser(null);
    setSavedTrips([]);
  };

  // Real Add/Save Trip handler linked to Mongoose database
  const saveTrip = async (itinerary) => {
    try {
      const savedTrip = await saveTripToDB({
        destination: itinerary.destination,
        duration: itinerary.duration,
        budget: itinerary.budget,
        travelers: itinerary.travelers || "1 Person",
        preferences: itinerary.preferences,
        itinerary: itinerary // Passes the full dynamic itinerary payload
      });

      // Update local state list
      setSavedTrips((prev) => [savedTrip, ...prev]);
    } catch (error) {
      console.error("Error saving trip to database:", error);
      throw new Error("Could not save the trip to your profile. Please try again.");
    }
  };

  // Real Delete Trip handler linked to Mongoose database
  const deleteTrip = async (mongoId) => {
    try {
      await deleteTripFromDB(mongoId);
      // Filter by Mongoose _id
      setSavedTrips((prev) => prev.filter((trip) => trip._id !== mongoId));
    } catch (error) {
      console.error("Error deleting trip from database:", error);
      alert("Failed to delete the trip from the database.");
    }
  };

  // Local Add Booking handler (transit demo page)
  const addBooking = (expert, date, slot) => {
    const newBooking = {
      id: Date.now(),
      expert: expert,
      date: date,
      slot: slot,
      status: "Confirmed",
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        savedTrips,
        bookings,
        login,
        signup,
        logout,
        saveTrip,
        deleteTrip,
        addBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
