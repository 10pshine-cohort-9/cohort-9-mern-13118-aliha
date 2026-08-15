const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");
const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected error on idle PostgreSQL client");
});

module.exports = pool;
