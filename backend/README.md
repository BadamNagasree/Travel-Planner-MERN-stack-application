# Secure Indian Travel Planner & Booking Backend

This is a premium, secure Node.js, Express.js, and MongoDB backend designed for your **Travel Planner** application. It has been customized specifically for **Indian Domestic Tourism** and calculated entirely in **Indian Rupees (INR, ₹)**. 

It acts as a hybrid **Itinerary Planner & Ticket Booking portal** by integrating realistic ticket bookings with platforms like **IRCTC** (trains), **redBus** (buses), **MakeMyTrip / Booking.com / Zostel** (flights/hotels), and **ASI Monument Portal** (heritage site tickets).

---

## Features & Architecture

*   **API Framework**: Fast, scalable REST endpoints built using Express.js.
*   **Database Integration**: MongoDB with Mongoose Schemas (User and Trip models).
*   **Secure Authentication**: JWT-based stateless authentication combined with custom auto-hashing pre-save hooks using `bcryptjs`.
*   **Indian Travel Booking & Caching**:
    *   **Currency**: Strictly calculates and outputs all pricing, activity fees, and lodging budgets in **Indian Rupees (INR, ₹)**.
    *   **Ticket Bookings**: Generates a structured `bookingInfo` node for every activity in the schedule, recommending the real-world platform (e.g. IRCTC, redBus, MakeMyTrip, Zostel, ASI) and generating direct web-booking links.
    *   **Response Cache**: Automatically stores generated itineraries in-memory with a 24-hour Time-To-Live (TTL) to avoid redundant API hits.
    *   **Fault-Tolerant Fallback**: If Hugging Face is overloaded or rate-limited, an intelligent domestic Indian procedural generator builds beautiful, customized itineraries (custom-tailored for destinations like Goa, Jaipur, Kerala, Manali, etc.) with real-world Indian prices. The server **never crashes**.
*   **Defense & Security**:
    *   `helmet` integration for HTTP header protection.
    *   CORS customized for standard React developer ports (`3000`, `5173`, and local loops).
    *   `express-rate-limit` implemented at three different granular tiers: Global limiters, Auth route limiters (brute force protection), and AI itinerary generation limiters (free-tier quota protection).
    *   Active input validation and character escaping utilizing `express-validator` to eliminate XSS or Mongo injections.

---

## Project Structure

```
backend/
├── controllers/          # Business logic handlers
│   ├── authController.js # Handles registration, logins, token issuance
│   └── tripController.js # Handles itinerary requests, saves, lists, deletions
├── middleware/           # Intercepting functions
│   ├── auth.js           # JWT verification and route protection
│   └── validation.js     # Sanitization and validation rules
├── models/               # Mongoose database models
│   ├── User.js           # Users schema and password hashing routines
│   └── Trip.js           # Trip parameters and itinerary content storage
├── routes/               # API route maps
│   ├── authRoutes.js     # Map /api/auth routes
│   └── tripRoutes.js     # Map /api/trips routes
├── services/             # Core service integrations
│   └── hfAiService.js    # Hugging Face API call, caching, and fallback logic
├── .env                  # Private secrets and environmental configuration
├── .env.example          # Sample environment variables reference
├── package.json          # Dependency control and startup scripts
└── README.md             # Integration and execution instructions
```

---

## Setup and Installation

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Version 18+ which has built-in `fetch` functionality).
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally (standard port `27017`) **OR** a MongoDB Atlas cloud URI.

### 2. Configure Environment Variables
Copy `.env.example` into a new file called `.env` in the `backend/` folder:
```bash
# In the backend directory
cp .env.example .env
```
Fill out the variables inside the `.env` file:
*   **`PORT`**: Set to your desired backend port (default: `5000`).
*   **`MONGODB_URI`**: Set to `mongodb://127.0.0.1:27017/travel-planner` (local) or your MongoDB Atlas connection string.
*   **`JWT_SECRET`**: A pre-made random secure token is provided, but you can change it to any secret phrase.
*   **`HF_API_KEY`**: Grab a free API key at [Hugging Face Developer Tokens](https://huggingface.co/settings/tokens) (requires **Read** access).
    *(Note: If you leave `HF_API_KEY` empty, the system automatically uses its high-fidelity local procedural generator fallback, meaning the travel planner remains fully functional even without a Hugging Face account!)*

---

## How to Run

### Development Mode (with hot-reloading)
Runs the server with `nodemon` to automatically restart whenever code changes are saved:
```bash
npm run dev
```

### Production Mode
Starts the server with standard node execution:
```bash
npm start
```

Once started, the backend is available at `http://localhost:5000`. You can test connection health by opening `http://localhost:5000/api/health` in your browser.

---

## API Documentation

### Authentication Endpoints

#### 1. User Signup
*   **URL**: `/api/auth/signup`
*   **Method**: `POST`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "securepassword123"
    }
    ```

#### 2. User Login
*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **Access**: Public

---

### Trip & Itinerary Endpoints
*Note: All endpoints below require a valid JWT token sent in the Authorization Header: `Authorization: Bearer <your_jwt_token>`.*

#### 1. Generate Itinerary (AI Plan & Booking Preview)
Generates the itinerary from the AI model (or pulls from cache) but **does not** save it in the database.
*   **URL**: `/api/trips/generate`
*   **Method**: `POST`
*   **Access**: Private
*   **Request Body**:
    ```json
    {
      "destination": "Goa",
      "duration": 3,
      "budget": "Moderate",
      "travelers": "2 People",
      "preferences": ["Beaches", "Water Sports", "Food"]
    }
    ```
*   **Successful Response (200 OK)**:
    ```json
    {
      "success": true,
      "itinerary": {
        "tripTitle": "Ultimate 3-Day Getaway to Goa",
        "destination": "Goa",
        "duration": 3,
        "budget": "Moderate",
        "travelers": "2 People",
        "preferences": ["Beaches", "Water Sports", "Food"],
        "currency": "INR (₹)",
        "costSummary": {
          "estimatedStayTotalINR": 7500,
          "estimatedFoodTotalINR": 4050,
          "estimatedActivitiesTotalINR": 4200,
          "estimatedLocalTransportINR": 2700,
          "estimatedGrandTotalINR": 18450
        },
        "bookingPartners": {
          "trains": "IRCTC",
          "buses": "redBus",
          "flightsAndHotels": "MakeMyTrip / Booking.com",
          "monuments": "Archaeological Survey of India (ASI)"
        },
        "days": [
          {
            "day": 1,
            "theme": "Arrival & Sightseeing",
            "schedule": [
              {
                "time": "Morning",
                "activity": "Visit the historic Aguada Fort & lighthouse",
                "location": "Sinquerim, Goa",
                "description": "Explore the 17th-century Portuguese fort overlooking the Arabian Sea. Highly recommended to hire a local guide.",
                "bookingInfo": {
                  "bookingPlatform": "ASI Monument Portal",
                  "estimatedCostINR": 50,
                  "bookingUrl": "https://asi.payumoney.com/"
                }
              },
              {
                "time": "Afternoon",
                "activity": "Water Sports activities (Jet Ski & Parasailing)",
                "location": "Calangute Beach",
                "description": "Indulge in adrenaline-pumping water sports with certified local operators.",
                "bookingInfo": {
                  "bookingPlatform": "TripAdvisor",
                  "estimatedCostINR": 1500,
                  "bookingUrl": "https://www.tripadvisor.in/Search?q=Goa"
                }
              }
            ],
            "budgetTip": "Opt for public transportation like KSRTC/HRTC buses (book via redBus) or local shared auto-rickshaws to optimize your local transport cost."
          }
        ]
      }
    }
    ```

#### 2. Save a Trip
Saves the completed itinerary into the database.
*   **URL**: `/api/trips`
*   **Method**: `POST`
*   **Access**: Private
*   **Request Body**: Same as parameters above, plus the `itinerary` object generated in the preview step.

#### 3. Fetch User Saved Trips
Retrieves all saved trips belonging to the authenticated user.
*   **URL**: `/api/trips`
*   **Method**: `GET`
*   **Access**: Private

#### 4. Delete a Trip
*   **URL**: `/api/trips/:id`
*   **Method**: `DELETE`
*   **Access**: Private

---

## React Frontend Connection Guide

Connecting your React application to this backend is simple. Use `axios` or standard `fetch` API.

### 1. Storing Token and Setting Authentication Header
When a user logs in or signs up, save the received JWT token in `localStorage`:
```javascript
// On successful Login/Signup response:
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### 2. Making Authenticated API Calls
Set up an Axios Instance that automatically appends the Bearer token:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### 3. Example Request Call (Generate & Book Trip in React)
Here's how a React page can render the travel itinerary, including direct ticket-booking links:

```javascript
import React, { useState } from 'react';
import api from './api';

function IndianTripPlanner() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  
  const handleGenerate = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/trips/generate', {
        destination: formData.destination,
        duration: parseInt(formData.duration),
        budget: formData.budget,
        travelers: formData.travelers,
        preferences: formData.preferences
      });
      setItinerary(response.data.itinerary);
    } catch (err) {
      alert(err.response?.data?.message || 'Error planning your trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Incredible India Travel Planner</h2>
      {/* Form and Generation Button */}
      
      {itinerary && (
        <div className="itinerary-card">
          <h3>{itinerary.tripTitle}</h3>
          <p><strong>Total Estimated Budget:</strong> ₹{itinerary.costSummary.estimatedGrandTotalINR}</p>
          
          <div className="days-list">
            {itinerary.days.map((day) => (
              <div key={day.day} className="day-card" style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                <h4>Day {day.day}: {day.theme}</h4>
                {day.schedule.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '15px' }}>
                    <h5>{item.time} - {item.activity} ({item.location})</h5>
                    <p>{item.description}</p>
                    {item.bookingInfo && (
                      <div style={{ backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                        <span><strong>Estimated Cost:</strong> ₹{item.bookingInfo.estimatedCostINR} </span>
                        <span>| <strong>Book via:</strong> {item.bookingInfo.bookingPlatform} </span>
                        <a 
                          href={item.bookingInfo.bookingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{
                            display: 'inline-block',
                            marginLeft: '10px',
                            backgroundColor: '#ff5a5f',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '0.85em'
                          }}
                        >
                          Book Tickets
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                <p style={{ fontStyle: 'italic', fontSize: '0.9em', color: '#555' }}>💡 {day.budgetTip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```
