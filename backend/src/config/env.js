require('dotenv').config();

/**
 * Centralized, validated access to environment configuration.
 * Every other module reads config through here rather than
 * touching `process.env` directly.
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  logLevel: process.env.LOG_LEVEL || 'info',
  // Comma-separated list of allowed origins, e.g.
  // "http://localhost:5173,https://notes.example.com". Defaults to the
  // Vite dev server so local development works with zero config.
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

function assertRequiredEnv() {
  if (env.nodeEnv === 'test') {
    // Tests supply their own minimal env (see backend/package.json's
    // `test` script) and stub out the data-access layer entirely, so the
    // stricter checks below don't apply here.
    return;
  }

  const missing = ['databaseUrl', 'jwtSecret'].filter((key) => !env[key]);
  if (missing.length > 0) {
    const names = missing.map((key) => (key === 'databaseUrl' ? 'DATABASE_URL' : 'JWT_SECRET'));
    // eslint-disable-next-line no-console
    console.error(
      `Missing required environment variable(s): ${names.join(', ')}. ` +
        'Copy .env.example to .env and fill in real values.',
    );
    process.exit(1);
  }

  const KNOWN_PLACEHOLDER_SECRETS = ['CHANGE_ME__THIS_IS_NOT_A_REAL_SECRET'];
  const MIN_JWT_SECRET_LENGTH = 32;

  if (KNOWN_PLACEHOLDER_SECRETS.includes(env.jwtSecret)) {
    // eslint-disable-next-line no-console
    console.error(
      'JWT_SECRET is still set to the .env.example placeholder value. ' +
        "Generate a real one: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
    process.exit(1);
  }

  if (env.jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    // eslint-disable-next-line no-console
    console.error(
      `JWT_SECRET is too short (${env.jwtSecret.length} chars; need at least ${MIN_JWT_SECRET_LENGTH}). ` +
        'A short secret is brute-forceable and undermines every issued token.',
    );
    process.exit(1);
  }

  // Known, accepted-but-unresolved risk: frontend/src/services/apiClient.js
  // stores the JWT in localStorage, which an XSS can read. That's a
  // reasonable trade-off for local development, but not something that
  // should reach a real deployment silently. Refuse to start in
  // production unless someone has explicitly reviewed and accepted this,
  // by setting the escape hatch below — a code comment alone isn't a
  // control, this is.
  if (env.nodeEnv === 'production' && process.env.ACKNOWLEDGE_LOCALSTORAGE_JWT_RISK !== 'true') {
    // eslint-disable-next-line no-console
    console.error(
      'Refusing to start with NODE_ENV=production: the frontend still stores ' +
        'JWTs in localStorage (vulnerable to token theft via XSS). Before a ' +
        'real production deployment, switch to an HttpOnly/Secure/SameSite ' +
        'cookie session with CSRF protection. If this is a reviewed, ' +
        'accepted risk (e.g. an internal demo), set ' +
        'ACKNOWLEDGE_LOCALSTORAGE_JWT_RISK=true to proceed anyway.',
    );
    process.exit(1);
  }
}

assertRequiredEnv();

module.exports = env;
