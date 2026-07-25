const AppError = require('../utils/AppError');

/**
 * Mounted after all routes. Any request that reaches this point matched
 * no route, so it is converted into a 404 AppError and handed to the
 * global error handler for a uniform response shape.
 *
 * Deliberately uses only the path, not the full originalUrl — a mistyped
 * or malicious request could carry a query string containing a token,
 * email, or other value that has no business being echoed back into an
 * error response or written into logs.
 */
module.exports = function notFound(req, res, next) {
  const [pathOnly] = req.originalUrl.split('?');
  next(new AppError(`Route not found: ${req.method} ${pathOnly}`, 404));
};
