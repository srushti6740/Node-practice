const STATUS_CODES = require('http-status-codes');
const { createResponse, handleHTTPError, verifyJWTToken } = require('../utils/helper');
const { logger } = require('../utils/logger');
const CustomError = require('../utils/customError');
const errorCode = require('../utils/errorCode');
const userRepository = require('../components/User/v1/UserRepository');
const { USER_ROLE } = require('../utils/constants');

class Middleware {
   /** Any logged in, active user. Attaches req.user */
   static async isAdminAuthorized(req, res, next) {
      try {   
         const header = req.headers.authorization;
         if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
            return createResponse({
               res,
               status: STATUS_CODES.UNAUTHORIZED,
               message: res.__('INVALID_ACCESS_TOKEN'),
               code: errorCode.error
            });
         }

         let decoded;
         try {
            decoded = verifyJWTToken(header);
         } catch (err) {
            return createResponse({
               res,
               status: STATUS_CODES.UNAUTHORIZED,
               message: res.__('INVALID_ACCESS_TOKEN'),
               code: errorCode.error
            });
         }

         // refresh / reset tokens are not access tokens
         if (decoded.type) {
            return createResponse({
               res,
               status: STATUS_CODES.UNAUTHORIZED,
               message: res.__('INVALID_ACCESS_TOKEN'),
               code: errorCode.error
            });
         }

         const user = await userRepository.findById(decoded._id);
         if (user.role != USER_ROLE.ADMIN) {
            throw new CustomError(['UNAUTHORIZED'], STATUS_CODES.UNAUTHORIZED);
         }
         if (!user) {
            throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.UNAUTHORIZED);
         }
         if (!user.isActive) {
            throw new CustomError(['USER.IN_ACTIVE'], STATUS_CODES.UNAUTHORIZED);
         }

         req.user = user;
         return next();
      } catch (error) {
         logger.error(__filename, 'isAuthorized', req.custom && req.custom.uuid, 'is authorized function error', error);
         return handleHTTPError({ error, res });
      }
   }

   static async isUserAuthorized(req, res, next) {
      try {
         const header = req.headers.authorization;
         if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
            return createResponse({
               res,
               status: STATUS_CODES.UNAUTHORIZED,
               message: res.__('INVALID_ACCESS_TOKEN'),
               code: errorCode.error
            });
         }

         let decoded;
         try {
            decoded = verifyJWTToken(header);
         } catch (err) {
            return createResponse({
               res,
               status: STATUS_CODES.UNAUTHORIZED,
               message: res.__('INVALID_ACCESS_TOKEN'),
               code: errorCode.error
            });
         }

         // refresh / reset tokens are not access tokens
         if (decoded.type) {
            return createResponse({
               res,
               status: STATUS_CODES.UNAUTHORIZED,
               message: res.__('INVALID_ACCESS_TOKEN'),
               code: errorCode.error
            });
         }

         const user = await userRepository.findById(decoded._id);

         if (!user) {
            throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.UNAUTHORIZED);
         }
         if (!user.isActive) {
            throw new CustomError(['USER.IN_ACTIVE'], STATUS_CODES.UNAUTHORIZED);
         }

         req.user = user;
         return next();
      } catch (error) {
         logger.error(__filename, 'isAuthorized', req.custom && req.custom.uuid, 'is authorized function error', error);
         return handleHTTPError({ error, res });
      }
   }
}

module.exports = Middleware;
