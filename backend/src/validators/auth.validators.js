const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateSignup({ name, email, password } = {}) {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("name must be at least 2 characters");
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    errors.push("a valid email is required");
  }
  if (
    !password ||
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  return errors;
}

function validateLogin({ email, password } = {}) {
  const errors = [];

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    errors.push("a valid email is required");
  }
  if (!password || typeof password !== "string") {
    errors.push("password is required");
  }

  return errors;
}

module.exports = {
  validateSignup,
  validateLogin,
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
};
