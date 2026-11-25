const { v4 } = require('uuid');

/** Adds a request level uuid (req.custom.uuid) used for log tracing */
module.exports = (app) => {
   app.use((req, res, next) => {
      if (req.custom && req.custom.uuid) {
         return next();
      }
      req.custom = { uuid: v4() };
      next();
   });
};
