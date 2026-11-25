const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const { logger } = require('../utils/logger');
const { i18n } = require('./i18n');
const uuid = require('./uuid');

/** logs the status (and body for non 200 responses) of every request */
const logResponseBody = (req, res, next) => {
   if (req.path.includes('download') || req.path.includes('export')) {
      return next();
   }

   const oldWrite = res.write;
   const oldEnd = res.end;
   const chunks = [];

   res.write = function (chunk) {
      try {
         if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      } catch (error) {
         logger.error(
            __filename,
            'logResponseBody.write',
            req.custom && req.custom.uuid,
            `Response logging error: ${error}`
         );
      }
      return oldWrite.apply(res, arguments);
   };

   res.end = function (chunk) {
      try {
         if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
         const body = Buffer.concat(chunks).toString('utf8');

         if (req.path !== '/health') {
            logger.debug(
               __filename,
               'logResponseBody',
               req.custom && req.custom.uuid,
               `${req.method} ${req.baseUrl}${req.path} - ${JSON.stringify(req.query)} - ${res.statusCode}${
                  res.statusCode !== 200 ? ` - ${body}` : ''
               }`
            );
         }
      } catch (error) {
         // response logging must never crash the application
         logger.error(
            __filename,
            'logResponseBody.end',
            req.custom && req.custom.uuid,
            `Response logging error: ${error}`
         );
      }
      return oldEnd.apply(res, arguments);
   };

   next();
};

const underMaintenanceCheck = (req, res, next) => {
   if (process.env.APP_UNDER_MAINTAINANCE === 'true') {
      logger.info(__filename, '', '', req.__('SERVICE_UNAVAILABLE'));
      return res.status(503).json({ status: 503, message: req.__('SERVICE_UNAVAILABLE') });
   }
   next();
};

/** global middlewares, bound before routes */
module.exports = (app) => {
   app.use(cors());
   app.use(i18n.init);
   app.use(logResponseBody);
   app.use(underMaintenanceCheck);
   uuid(app); // add uuid in req if not available
   // add all other middleware here
};

/** body parsers / static / uploads, bound just before the routes */
module.exports.adminMiddleware = (app) => {
   app.use(compression());
   app.use(bodyParser.json({ limit: '50mb' }));
   app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
   app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } })); // 50 MB
   app.use('/uploads', express.static('uploads'));
   app.use('/public', express.static('public'));
};
