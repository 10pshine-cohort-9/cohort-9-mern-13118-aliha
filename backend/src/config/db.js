const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Shared PostgreSQL connection pool.
 * The data-access layer imports this rather than creating its own clients,
 * so connection lifecycle/limits are managed in exactly one place.
 */
const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

module.exports = pool;
