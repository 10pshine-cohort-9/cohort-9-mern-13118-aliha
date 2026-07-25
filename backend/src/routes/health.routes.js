const express = require('express');

const router = express.Router();

/**
 * Public liveness/readiness probe. Used by CI, load balancers, and the
 * repo scaffold's own smoke test — kept dependency-free so it works even
 * before the database is provisioned.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

module.exports = router;
