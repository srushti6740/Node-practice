const STATUS_CODES = require('http-status-codes');
const errorCode = require('./errorCode');

/**
 * Error that is safe to show to the client.
 * `error` is an i18n key (or [key, ...replacements]).
 */
class CustomError extends Error {
   constructor(error, statusCode, data, code) {
      super();

      if (Error.captureStackTrace) {
         Error.captureStackTrace(this, CustomError);
      }

      this.name = 'CustomError';
      this.error = Array.isArray(error) ? error : [error];
      this.statusCode = statusCode || STATUS_CODES.PRECONDITION_FAILED;
      this.data = data || {};
      this.code = code || errorCode.error;
   }
}

module.exports = CustomError;
