const { randomUUID } = require('crypto');

/**
 * Assigns a correlation id to every request (or reuses one supplied by an
 * upstream proxy/client via X-Request-Id). Downstream logging and the
 * global error handler both reference req.requestId so a client-visible
 * requestId can always be traced back to the exact log lines for that call.
 */
module.exports = function requestId(req, res, next) {
  req.requestId = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};
