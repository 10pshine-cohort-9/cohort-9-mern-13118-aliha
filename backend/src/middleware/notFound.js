const AppError = require('../utils/AppError');

/**
 * Mounted after all routes. Any request that reaches this point matched
 * no route, so it is converted into a 404 AppError and handed to the
 * global error handler for a uniform response shape.
 */
module.exports = function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
