const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validation');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user with validation and input sanitization
 * @access  Public
 */
router.post('/signup', validateSignup, authController.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return a JWT token with validation
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

module.exports = router;
