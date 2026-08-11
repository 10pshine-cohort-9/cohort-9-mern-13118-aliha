const authService = require("../services/auth.service");
const {
  validateSignup,
  validateLogin,
} = require("../validators/auth.validators");
const AppError = require("../utils/AppError");

async function signup(req, res, next) {
  try {
    const errors = validateSignup(req.body);
    if (errors.length > 0) {
      throw new AppError("Validation failed", 400, { errors });
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.signup({ name, email, password });

    res.status(201).json({ status: "success", data: { user, token } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      throw new AppError("Validation failed", 400, { errors });
    }

    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    res.status(200).json({ status: "success", data: { user, token } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  // Stateless JWT: the server does not maintain session state. The client
  // should discard the token on logout. If token revocation is required
  // later, implement a server-side blocklist (e.g. Redis keyed by `jti`).
  res.status(200).json({ status: "success", data: { message: "Logged out" } });
}

module.exports = { signup, login, logout };
