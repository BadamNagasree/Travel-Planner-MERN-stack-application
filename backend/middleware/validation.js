const { body, validationResult } = require('express-validator');

// Generic helper to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules for User Signup
const validateSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Validation rules for User Login
const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Validation rules for Trip Planning & Creation
const validateTrip = [
  body('destination')
    .trim()
    .notEmpty().withMessage('Destination is required')
    .isLength({ max: 100 }).withMessage('Destination cannot exceed 100 characters')
    .escape(),
  body('duration')
    .isInt({ min: 1, max: 30 }).withMessage('Duration must be between 1 and 30 days'),
  body('budget')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Budget string cannot exceed 50 characters')
    .escape(),
  body('travelers')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Travelers description cannot exceed 50 characters')
    .escape(),
  body('preferences')
    .optional()
    .isArray().withMessage('Preferences must be an array of strings'),
  body('preferences.*')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Preference tags cannot exceed 50 characters')
    .escape(),
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateTrip
};
