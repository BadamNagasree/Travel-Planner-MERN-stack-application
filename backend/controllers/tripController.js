const Trip = require('../models/Trip');
const hfAiService = require('../services/hfAiService');

/**
 * Generate a travel itinerary using Hugging Face AI (Cached, stateless preview)
 * POST /api/trips/generate
 */
exports.generateItinerary = async (req, res) => {
  try {
    const { destination, duration, budget, travelers, preferences } = req.body;

    // Call Hugging Face service (handles rate limiting cache & procedural fallbacks)
    const itinerary = await hfAiService.generateItinerary(
      destination,
      duration,
      budget,
      travelers,
      preferences
    );

    return res.status(200).json({
      success: true,
      itinerary
    });
  } catch (error) {
    console.error('Generate Itinerary Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating the AI itinerary.'
    });
  }
};

/**
 * Save a generated trip plan to MongoDB
 * POST /api/trips
 */
exports.saveTrip = async (req, res) => {
  try {
    const { 
      destination, 
      startDate, 
      endDate, 
      duration, 
      budget, 
      travelers, 
      preferences, 
      itinerary 
    } = req.body;

    if (!itinerary) {
      return res.status(400).json({
        success: false,
        message: 'Itinerary content is required to save a trip.'
      });
    }

    // Build the new trip object linking it to current authenticated user
    const newTrip = new Trip({
      userId: req.user.id,
      destination,
      startDate,
      endDate,
      duration,
      budget,
      travelers,
      preferences,
      itinerary
    });

    const savedTrip = await newTrip.save();

    return res.status(201).json({
      success: true,
      message: 'Trip saved successfully!',
      trip: savedTrip
    });
  } catch (error) {
    console.error('Save Trip Controller Error:', error);
    
    // Catch Mongoose schema errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while saving the trip plan.'
    });
  }
};

/**
 * Fetch all saved trips for the authenticated user
 * GET /api/trips
 */
exports.getUserTrips = async (req, res) => {
  try {
    // Find all trips belonging to current user, sort by latest
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error('Get User Trips Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your saved trips.'
    });
  }
};

/**
 * Delete a specific saved trip plan
 * DELETE /api/trips/:id
 */
exports.deleteTrip = async (req, res) => {
  try {
    const tripId = req.params.id;

    // Find the trip
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip plan not found.'
      });
    }

    // Security check: Verify that current user owns the trip
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this trip.'
      });
    }

    // Delete the trip using deleteOne
    await trip.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Trip plan deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Trip Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the trip.'
    });
  }
};
