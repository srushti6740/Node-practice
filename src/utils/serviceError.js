/**
 * Error thrown by helpers (business layer).
 * Controllers map the `error` code to a CustomError.
 */
class ServiceError extends Error {
   constructor(error, data = {}, ...params) {
      super(...params);

      if (Error.captureStackTrace) {
         Error.captureStackTrace(this, ServiceError);
      }

      this.name = 'ServiceError';
      this.error = error;
      this.data = data;
   }
}

module.exports = ServiceError;
