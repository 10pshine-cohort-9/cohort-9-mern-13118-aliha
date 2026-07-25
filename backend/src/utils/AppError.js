/**
 * Base class for all operational (expected) errors thrown by the app.
 * Controllers/services throw AppError (or a subclass) with an explicit
 * HTTP status; the global error middleware knows how to translate that
 * into the uniform { status, message, requestId } response shape.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
