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
};

function assertRequiredEnv() {
  const required = ['databaseUrl', 'jwtSecret'];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0 && env.nodeEnv !== 'test') {
    // eslint-disable-next-line no-console
    console.error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in real values.',
    );
  }
}

assertRequiredEnv();

module.exports = env;
