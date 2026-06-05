const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a specific user ID
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user with this email address already exists.' 
      });
    }

    // Create user (password is automatically hashed via Mongoose pre-save hook)
    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during account registration.' 
    });
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Verify password using User model instance method
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login.' 
    });
  }
};
