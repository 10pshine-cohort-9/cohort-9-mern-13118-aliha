const logger = require('../utils/logger');

/**
 * Single global error-handling middleware (must be registered last).
 * - Every response follows the same shape: { status, message, requestId }
 * - 5xx internals are never leaked to the client; the real message/stack
 *   is only ever written to the Pino log, keyed by requestId.
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const isServerError = statusCode >= 500;
  const message = isServerError ? 'Internal server error' : err.message;

  logger.error(
    {
      err,
      requestId: req.requestId,
      statusCode,
      path: req.originalUrl,
      method: req.method,
    },
    'Request error',
  );

  res.status(statusCode).json({
    status: 'error',
    message,
    requestId: req.requestId,
  });
};
