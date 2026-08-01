const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(env.port, () => {
  logger.info(`Backend server listening on port ${env.port} [${env.nodeEnv}]`);
});

server.on('error', (err) => {
  // Without this listener, a bind failure (e.g. EADDRINUSE — something
  // else already using this port) is an unhandled 'error' event, which
  // Node turns into an uncaught exception: a raw stack trace instead of
  // a clear, logged reason for why startup failed.
  logger.error({ err }, `Server failed to start on port ${env.port}`);
  process.exit(1);
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

  server.close((err) => {
    clearTimeout(forceExitTimer);

    if (err) {
      // server.close() reports failure via this argument (e.g.
      // ERR_SERVER_NOT_RUNNING if it was already closed) — silently
      // exiting 0 here would tell an orchestrator the shutdown succeeded
      // when it didn't.
      logger.error({ err }, 'Server failed to close cleanly during shutdown');
      process.exit(1);
      return;
    }

    process.exit(0);
  });
});

module.exports = server;
