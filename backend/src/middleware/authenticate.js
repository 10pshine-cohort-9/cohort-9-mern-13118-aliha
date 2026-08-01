const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Verifies the Bearer JWT on protected routes and attaches the decoded
 * identity to req.user. Per the STS, every backend route other than
 * /api/auth/signup and /api/auth/login must sit behind this middleware.
 *
 * NOTE: token *issuance* (signup/login controllers, bcrypt hashing) is the
 * next Sprint 1 deliverable and is intentionally not implemented here.
 */
module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or malformed Authorization header', 401));
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
};
