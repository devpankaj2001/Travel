const config = require('../config');

/**
 * Handle 404 Route Not Found
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
};

/**
 * Global Error Handler (Production Safe)
 */
const errorHandler = (err, req, res, next) => {
  // Always log full error on server
  console.error('[Unhandled Error]:', err);

  const statusCode = err.statusCode || err.status || 500;
  
  // Safe error messaging in production
  let message = err.message || 'Internal Server Error';
  if (config.app.isProduction && statusCode === 500) {
    message = 'An unexpected internal error occurred. Please try again later.';
  }

  const response = {
    success: false,
    message
  };

  if (!config.app.isProduction) {
    response.stack = err.stack;
    if (err.errors) response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
