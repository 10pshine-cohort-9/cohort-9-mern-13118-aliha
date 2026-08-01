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

  // err.details has no fixed shape (a controller could put anything in
  // it), so the logger's static redact paths (see utils/logger.js) can't
  // reliably scrub secrets nested arbitrarily inside it. Build the logged
  // error explicitly rather than spreading err (spread only picks up own
  // enumerable properties, which can silently drop .stack depending on
  // engine behavior — not a trade-off worth making for log completeness).
  const errForLogging = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code,
  };

  logger.error(
    {
      err: errForLogging,
      requestId: req.requestId,
      statusCode,
      path: req.originalUrl,
      method: req.method,
    },
    'Request error',
  );

  const response = {
    status: 'error',
    message,
    requestId: req.requestId,
  };

  // Additive, optional field — only ever present for 4xx client errors
  // (e.g. the validation error array from auth.controller.js), and only
  // when the AppError actually set one. 5xx responses never include it,
  // consistent with never leaking server internals to the client.
  if (!isServerError && err.details !== undefined) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};
