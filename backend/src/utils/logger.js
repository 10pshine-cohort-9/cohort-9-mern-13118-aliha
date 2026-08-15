const pino = require("pino");
const env = require("../config/env");
const logger = pino({
  level: env.nodeEnv === "test" ? "silent" : env.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "password",
      "password_hash",
      "*.password",
      "*.password_hash",
    ],
    censor: "[REDACTED]",
  },
});

module.exports = logger;
