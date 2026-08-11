const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(env.port, () => {
  logger.info(`Backend server listening on port ${env.port} [${env.nodeEnv}]`);
});

server.on("error", (err) => {
  logger.error({ err }, `Server failed to start on port ${env.port}`);
  process.exit(1);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");

  const forceExitTimer = setTimeout(() => {
    logger.error(
      `Graceful shutdown exceeded ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit`,
    );
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close((err) => {
    clearTimeout(forceExitTimer);

    if (err) {
      logger.error({ err }, "Server failed to close cleanly during shutdown");
      process.exit(1);
      return;
    }

    process.exit(0);
  });
});

module.exports = server;
