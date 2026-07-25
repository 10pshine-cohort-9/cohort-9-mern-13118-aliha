const pino = require('pino');
const env = require('../config/env');

/**
 * Application-wide structured logger.
 * Sensitive fields are redacted so credentials/tokens never hit log output.
 */
const logger = pino({
  level: env.nodeEnv === 'test' ? 'silent' : env.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'password',
      'password_hash',
      '*.password',
      '*.password_hash',
    ],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
