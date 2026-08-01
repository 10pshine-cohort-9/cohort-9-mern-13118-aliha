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

    const isValidHttpErrorCode =
      Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599;

    if (!isValidHttpErrorCode) {
      // A bad statusCode here is a programming mistake, not a runtime
      // condition — better to catch it loudly in development/CI than to
      // let it silently reach res.status(NaN) or res.status(200) on an
      // error path and confuse whoever's debugging later.
      // eslint-disable-next-line no-console
      console.warn(
        `AppError constructed with an invalid statusCode (${statusCode}); ` +
          'falling back to 500. Expected an integer between 400 and 599.',
      );
    }

    this.statusCode = isValidHttpErrorCode ? statusCode : 500;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
