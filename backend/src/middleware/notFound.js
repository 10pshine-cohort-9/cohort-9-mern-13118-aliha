const AppError = require("../utils/AppError");

module.exports = function notFound(req, res, next) {
  const [pathOnly] = req.originalUrl.split("?");
  next(new AppError(`Route not found: ${req.method} ${pathOnly}`, 404));
};
