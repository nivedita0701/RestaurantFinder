// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    // Set the default status code and message
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    // Send the error response
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
    });
  };
  
  module.exports = { errorHandler };
  