const logger = require("../utils/logger");
module.exports = function errorHandler(err, req, res, next) {
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const isServerError = statusCode >= 500;
  const message = isServerError ? "Internal server error" : err.message;
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
    "Request error",
  );

  const response = {
    status: "error",
    message,
    requestId: req.requestId,
  };
  if (!isServerError && err.details !== undefined) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};
