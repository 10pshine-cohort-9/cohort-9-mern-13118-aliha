const crypto = require("crypto");
const env = require("../config/env");
const authService = require("../services/auth.service");
const {
  validateSignup,
  validateLogin,
} = require("../validators/auth.validators");
const AppError = require("../utils/AppError");

const ONE_HOUR_MS = 60 * 60 * 1000;
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production",
  path: "/",
  maxAge: ONE_HOUR_MS,
};

function setAuthCookies(res, token) {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("access_token", token, cookieOptions);
  res.cookie("csrfToken", csrfToken, {
    ...cookieOptions,
    httpOnly: false,
  });

  return csrfToken;
}

async function signup(req, res, next) {
  try {
    const errors = validateSignup(req.body);
    if (errors.length > 0) {
      throw new AppError("Validation failed", 400, { errors });
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.signup({ name, email, password });
    const csrfToken = setAuthCookies(res, token);

    res.status(201).json({
      status: "success",
      data: { user, csrfToken },
    });
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
    const csrfToken = setAuthCookies(res, token);

    res.status(200).json({
      status: "success",
      data: { user, csrfToken },
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("csrfToken", { path: "/" });
  res.status(200).json({ status: "success", data: { message: "Logged out" } });
}

module.exports = { signup, login, logout };
