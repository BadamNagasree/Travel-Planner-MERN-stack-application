const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [100, 'Destination name cannot exceed 100 characters']
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  duration: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [30, 'Duration cannot exceed 30 days']
  },
  budget: {
    type: String,
    trim: true,
    default: 'Moderate'
  },
  travelers: {
    type: String,
    trim: true,
    default: '1 Person'
  },
  preferences: {
    type: [String],
    default: []
  },
  itinerary: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Itinerary content is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
