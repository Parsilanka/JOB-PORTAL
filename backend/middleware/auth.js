const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: error.message
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.accountType}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is job seeker
exports.isJobSeeker = (req, res, next) => {
  if (req.user.accountType !== 'job_seeker') {
    return res.status(403).json({
      success: false,
      message: 'Only job seekers can access this route'
    });
  }
  next();
};

// Check if user is employer
exports.isEmployer = (req, res, next) => {
  if (req.user.accountType !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Only employers can access this route'
    });
  }
  next();
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.accountType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can access this route'
    });
  }
  next();
};

// Alias for protect middleware
exports.authenticate = exports.protect;
