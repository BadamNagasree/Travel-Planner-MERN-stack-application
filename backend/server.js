const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environmental variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();

// Use Helmet for secure HTTP response headers (helps against XSS, clickjacking, etc.)
app.use(helmet());

// Dynamic CORS configurations supporting both local development and production
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:5173', // Vite default port
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

// Parse additional comma-separated origins from CLIENT_URL (for multiple deployed frontends)
if (process.env.CLIENT_URL && process.env.CLIENT_URL.includes(',')) {
  process.env.CLIENT_URL.split(',').forEach(url => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile applications, postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.warn(`Origin block by CORS policy: ${origin}`);
      return callback(new Error('Access denied by CORS policy.'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body-parser limits to protect against Denial of Service (DoS) attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 1. Global API rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 2. Authentication specific rate limiter (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 attempts
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// 3. AI generation specific rate limiter (safeguards free-tier Hugging Face limits)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 itinerary generations per hour
  message: {
    success: false,
    message: 'Itinerary generation limit reached for this hour. Please try again later to protect free API quotas.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/trips/generate', aiLimiter);

// Connect Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Health Check Endpoint (useful for verifying services and connections)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Healthy',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Catch-all route (404 Not Found handler)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Requested API endpoint does not exist.'
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error Log:', err.stack || err.message || err);

  // Return a generic user-friendly message without leaking critical internal error stacks
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

// Startup Database and Server Connections
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel-planner';

console.log('Attempting connection to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB successfully connected.');
    app.listen(PORT, () => {
      console.log(`Secure Server successfully running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: Database connection failed. Server shutting down.');
    console.error(err.message);
    process.exit(1);
  });
