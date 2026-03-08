function errorHandler(err, req, res, next) {
  console.error('[Error]', err.type || 'SERVER_ERROR', err.message, err.stack);

  const statusMap = {
    BUDGET_EXCEEDED: 402,
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    SEND_FAILED: 500,
  };

  const status = statusMap[err.type] || err.status || 500;

  res.status(status).json({
    error: err.type || 'SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
  });
}

module.exports = errorHandler;
