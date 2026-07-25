const authService = require('../services/auth.service');
const { validateSignup, validateLogin } = require('../validators/auth.validators');
const AppError = require('../utils/AppError');

async function signup(req, res, next) {
  try {
    const errors = validateSignup(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400);
    }

    const { name, email, password } = req.body;
    const { user, token } = await authService.signup({ name, email, password });

    res.status(201).json({ status: 'success', data: { user, token } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400);
    }

    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    res.status(200).json({ status: 'success', data: { user, token } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  // Stateless JWT: the server holds no session record to destroy, so
  // there is nothing to delete here — the client discards the token.
  // Requiring `authenticate` on this route still confirms the caller
  // held a valid token at the moment of logout.
  //
  // KNOWN LIMITATION: a token issued before logout stays valid until it
  // expires. If server-side revocation becomes a hard requirement, add a
  // short-lived token-blocklist (e.g. Redis, keyed by the JWT's `jti`)
  // in a later sprint — flagged in Section 10 (Risk Management) follow-up.
  res.status(200).json({ status: 'success', data: { message: 'Logged out' } });
}

module.exports = { signup, login, logout };
