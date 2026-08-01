const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');

const logger = require('./utils/logger');
const env = require('./config/env');
const requestId = require('./middleware/requestId');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Correlation id must be assigned before anything else logs or responds.
app.use(requestId);

app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.requestId }),
    // Reduce noise: only log request/response summaries, not full bodies.
    autoLogging: true,
  }),
);

app.use(
  cors({
    origin: env.corsOrigins,
  }),
);
app.use(express.json());

app.use('/api', routes);

// Order matters: notFound converts unmatched routes into an AppError,
// errorHandler is the single place that turns any error into a response.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
