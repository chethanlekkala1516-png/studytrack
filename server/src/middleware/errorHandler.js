function errorHandler(err, req, res, next) {
  // Log server-side for debugging
  console.error('[SERVER ERROR]:', err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    error: err.message || 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { details: err.stack })
  });
}

module.exports = errorHandler;
