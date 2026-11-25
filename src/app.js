const express = require('express');
const STATUS_CODES = require('http-status-codes');
const { logger } = require('./utils/logger');
const middlewares = require('./middlewares');
const routes = require('./routes');
const app = express();

middlewares(app); // bind middlewares

routes(app); // initialize all routes
// Base route to health check
app.get('/health', (req, res) => {
   return res.status(200).send('healthy');
});

// Handle invalid route
app.all('/*', (req, res) => {
   logger.info(__filename, 'Invalid Route Handler', req.custom && req.custom.uuid, 'Invalid Route Fired : ' + req.path);
   return res.status(STATUS_CODES.FORBIDDEN).send(STATUS_CODES.getStatusText(STATUS_CODES.FORBIDDEN));
});
module.exports = app;
