/**
 * API service for the Travel Planner AI application.
 * Integrates directly with the secure Node.js/Express.js backend.
 */

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Helper to construct standard request headers, automatically attaching the JWT auth token.
 */
const getHeaders = () => {
  const token = localStorage.getItem("travel_planner_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

/**
 * Fetches personalized seasonal domestic Indian travel recommendations for the sidebar.
 */
export async function getRecommendations(prefs) {
  // Return realistic, detailed Indian travel suggestions using Rupees and booking links info
  return [
    {
      generated_text: "🏖️ Goa Beach Getaway: Plan a perfect 4-day trip. Book sleeper Volvo buses on redBus and secure cozy boutique hostels on Zostel (Est. ₹6,500/person)."
    },
    {
      generated_text: "🏰 Historic Rajasthan: Explore Amber Fort and City Palace in Jaipur. Reserve monument entry passes online via the ASI Monument Portal to skip lines (Est. ₹200)."
    },
    {
      generated_text: "🛶 Kerala Backwaters: Traditional houseboat stay in Alleppey. Book luxury packages on MakeMyTrip or check homestays on Booking.com (Est. ₹12,000)."
    },
    {
      generated_text: "🏔️ Majestic Manali: Cable car rides and mountain trekking. Book train tickets to Chandigarh via IRCTC, then take a connecting Volvo (Est. ₹8,500)."
    }
  ];
}

/**
 * Generates a domestic Indian travel itinerary using the backend AI service.
 * @param {Object} tripDetails - Destination, days, budget, travelStyle
 * @returns {Promise<Object>} The generated itinerary details.
 */
export async function generateItinerary({ destination, days, budget, travelStyle }) {
  const response = await fetch(`${API_BASE_URL}/trips/generate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      destination,
      duration: parseInt(days) || 3,
      budget: budget || "Moderate",
      travelers: "1 Person",
      preferences: [travelStyle]
    })
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to generate AI itinerary. Please ensure the backend server is running.");
  }

  // Returns the rich itinerary object containing costSummary and days schedule
  return data.itinerary;
}

/**
 * Saves a completed trip plan to the backend database.
 */
export async function saveTripToDB(tripData) {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(tripData)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to save the trip.");
  }

  return data.trip;
}

/**
 * Deletes a saved trip from the backend database.
 */
export async function deleteTripFromDB(tripId) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete the trip.");
  }

  return true;
}

/**
 * Retrieves all saved trips belonging to the logged-in user from MongoDB.
 */
export async function fetchUserTrips() {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "GET",
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch saved trips.");
  }

  return data.trips;
}
