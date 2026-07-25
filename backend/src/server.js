const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(env.port, () => {
  logger.info(`Backend server listening on port ${env.port} [${env.nodeEnv}]`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');

  // If an open (e.g. keep-alive) connection prevents server.close()'s
  // callback from ever firing, don't hang the process indefinitely —
  // force-exit after a bounded grace period instead.
  const forceExitTimer = setTimeout(() => {
    logger.error(`Graceful shutdown exceeded ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close(() => {
    clearTimeout(forceExitTimer);
    process.exit(0);
  });
});

module.exports = server;
