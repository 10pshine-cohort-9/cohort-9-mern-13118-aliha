const express = require('express');

const router = express.Router();

/**
 * LIVENESS probe only — confirms the Node process is up and responsive.
 * Deliberately does NOT check PostgreSQL connectivity or any other
 * dependency, so it works even before the database is provisioned, and
 * a database outage doesn't make this process look unhealthy when the
 * process itself is fine.
 *
 * If a READINESS probe (are dependencies actually reachable?) becomes
 * necessary — e.g. for a load balancer that shouldn't route traffic to
 * an instance that can't reach Postgres — add a separate GET /ready
 * route with a bounded-timeout dependency check, rather than overloading
 * this one.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

module.exports = router;
