const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth');
const { validateTrip } = require('../middleware/validation');

// Apply auth middleware to protect all trip-related routes
router.use(auth);

/**
 * @route   POST /api/trips/generate
 * @desc    Generate a travel itinerary using Hugging Face AI (preview only)
 * @access  Private
 */
router.post('/generate', validateTrip, tripController.generateItinerary);

/**
 * @route   POST /api/trips
 * @desc    Save a generated trip plan to the user's account
 * @access  Private
 */
router.post('/', validateTrip, tripController.saveTrip);

/**
 * @route   GET /api/trips
 * @desc    Fetch all saved trips for the authenticated user
 * @access  Private
 */
router.get('/', tripController.getUserTrips);

/**
 * @route   DELETE /api/trips/:id
 * @desc    Delete a specific saved trip plan
 * @access  Private
 */
router.delete('/:id', tripController.deleteTrip);

module.exports = router;
