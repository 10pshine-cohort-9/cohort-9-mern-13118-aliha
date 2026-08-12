require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  logLevel: process.env.LOG_LEVEL || "info",

  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

function assertRequiredEnv() {
  if (env.nodeEnv === "test") {
    return;
  }

  const missing = ["databaseUrl", "jwtSecret"].filter((key) => !env[key]);
  if (missing.length > 0) {
    const names = missing.map((key) =>
      key === "databaseUrl" ? "DATABASE_URL" : "JWT_SECRET",
    );
    console.error(
      `Missing required environment variable(s): ${names.join(", ")}. ` +
        "Copy .env.example to .env and fill in real values.",
    );
    process.exit(1);
  }

  const KNOWN_PLACEHOLDER_SECRETS = ["CHANGE_ME__THIS_IS_NOT_A_REAL_SECRET"];
  const MIN_JWT_SECRET_LENGTH = 32;

  if (KNOWN_PLACEHOLDER_SECRETS.includes(env.jwtSecret)) {
    console.error(
      "JWT_SECRET is set to the example placeholder. Generate and set a real JWT_SECRET.",
    );
    process.exit(1);
  }

  if (env.jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    console.error(
      `JWT_SECRET is too short (${env.jwtSecret.length} chars). Provide a secret with at least ${MIN_JWT_SECRET_LENGTH} chars.`,
    );
    process.exit(1);
  }
}

assertRequiredEnv();

module.exports = env;
