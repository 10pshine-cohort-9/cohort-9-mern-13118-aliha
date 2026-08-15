const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");

function parseCookieHeader(cookieHeader) {
  return (cookieHeader || "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((memo, entry) => {
      const [key, ...rest] = entry.split("=");
      memo[key] = decodeURIComponent(rest.join("="));
      return memo;
    }, {});
}

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const cookies = parseCookieHeader(req.headers.cookie);
  const tokenFromHeader =
    header && header.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : null;
  const tokenFromCookie = cookies.access_token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return next(new AppError("Missing or malformed Authorization header", 401));
  }

  const hasAuthHeader = Boolean(tokenFromHeader);
  if (!hasAuthHeader && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const csrfToken = req.headers["x-csrf-token"];
    if (!csrfToken || csrfToken !== cookies.csrfToken) {
      return next(new AppError("Missing or invalid CSRF token", 403));
    }
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
};
