class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = this.constructor.name;

    const isValidHttpErrorCode =
      Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599;

    if (!isValidHttpErrorCode) {
      console.warn(
        `AppError constructed with invalid statusCode (${statusCode}); using 500.`,
      );
    }

    this.statusCode = isValidHttpErrorCode ? statusCode : 500;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
