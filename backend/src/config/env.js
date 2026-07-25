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

  const KNOWN_PLACEHOLDER_SECRETS = ['replace_with_strong_secret'];
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
}

assertRequiredEnv();

module.exports = env;
