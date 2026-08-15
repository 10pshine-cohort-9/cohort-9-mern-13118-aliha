const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");

const logger = require("./utils/logger");
const env = require("./config/env");
const requestId = require("./middleware/requestId");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();

app.use(requestId);

app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.requestId }),
    autoLogging: true,
  }),
);

app.use(
  cors({
    origin: env.corsOrigins,
  }),
);
app.use(express.json());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
