const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const usersRepository = require('../data-access/users.repository');

// Lower cost factor in tests keeps the suite fast without weakening the
// production hashing cost (12), which is unaffected by this branch.
const SALT_ROUNDS = env.nodeEnv === 'test' ? 4 : 12;

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

async function signup({ name, email, password }) {
  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    throw new AppError('An account with that email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await usersRepository.createUser({ name, email, passwordHash });
  const token = issueToken(user);

  return { user, token };
}

async function login({ email, password }) {
  const record = await usersRepository.findByEmail(email);
  if (!record) {
    // Deliberately identical to the wrong-password case below: never
    // reveal whether an email is registered.
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, record.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const { password_hash: _passwordHash, ...user } = record;
  const token = issueToken(user);

  return { user, token };
}

module.exports = { signup, login };
