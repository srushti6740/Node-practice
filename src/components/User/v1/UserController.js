const STATUS_CODES = require('http-status-codes');
const CustomError = require('../../../utils/customError');
const ServiceError = require('../../../utils/serviceError');
const { logger } = require('../../../utils/logger');

const {
   createResponse,
   handleHTTPError,
   createJWTTokenWithExpire,
   generateOTP,
   getOtpExpire,
   verifyJWTTokenWithoutBarer,
   getPageNumber,
   getRecordsPerPage,
   getSortBy,
   getSortOrder
} = require('../../../utils/helper');
const userService = require('./UserService');

class Controller {
   static async createUser(req, res) {
      try {
         const { first_name, last_name, email, password, phone_code, phone_number, role } = req.body;
         let user;
         try {
            user = await userService.createUser({ first_name, last_name, email, password, phone_code, phone_number, role });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'EMAIL_ALREADY_EXISTS':
                  throw new CustomError(['USER.ALREADY_REGISTER'], STATUS_CODES.CONFLICT);
               default:
                  throw error;
            }
         }

         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('USER.CREATE.SUCCESS'),
            payload: { user }
         });
      } catch (error) {
         logger.error(__filename, 'createUser', req.custom.uuid, 'Error during create user', error);
         handleHTTPError({ error, res });
      }
   }

   static async verifyOTP(req, res) {
      try {
         let data;
         try {
            data = await userService.verifyOTP({ email: req.body.email, otp: req.body.otp });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
               case 'OTP_INVALID':
                  throw new CustomError(['USER.OTP.INVALID'], STATUS_CODES.BAD_REQUEST);
               case 'OTP_EXPIRED':
                  throw new CustomError(['USER.OTP.EXPIRED'], STATUS_CODES.BAD_REQUEST);
               case 'OTP_ATTEMPTS_EXCEEDED':
                  throw new CustomError(['USER.OTP.ATTEMPTS_EXCEEDED'], STATUS_CODES.TOO_MANY_REQUESTS);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('AUTH.OTP.VERIFIED'),
            payload: data
         });
      } catch (error) {
         logger.error(__filename, 'verifyOTP', req.custom.uuid, 'Error during verify otp', error);
         handleHTTPError({ error, res });
      }
   }

   static async userLogin(req, res) {
      try {
         const { email, password } = req.body;
         let user;
         try {
            user = await userService.login({ email, password });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'INVALID_CREDENTIALS':
                  throw new CustomError(['USER.INVALID_CREDENTIALS'], STATUS_CODES.UNAUTHORIZED);
               case 'USER_INACTIVE':
                  throw new CustomError(['USER.IN_ACTIVE'], STATUS_CODES.UNAUTHORIZED);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('USER.LOGIN.SUCCESS'),
            payload: { user: user.user, token: user.token }
         });
      } catch (error) {
         logger.error(__filename, 'userLogin', req.custom.uuid, 'Error during login', error);
         handleHTTPError({ error, res });
      }
   }

   static async getUserList(req, res) {
      try {
         const pageNumber = getPageNumber(req);
         const recordsPerPage = getRecordsPerPage(req);
         const sortOrder = getSortOrder(req);

         // the list has no business errors to map
         const { users, total, sortField } = await userService.getUserList({
            filters: req.query,
            sortBy: getSortBy(req),
            sortOrder,
            pageNumber,
            recordsPerPage
         });

         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('USER.LIST.SUCCESS'),
            payload: { users },
            pager: { sortField, sortOrder, pageNumber, recordsPerPage, totalRecords: total }
         });
      } catch (error) {
         logger.error(__filename, 'getUserList', req.custom.uuid, 'Error during get user list', error);
         handleHTTPError({ error, res });
      }
   }

   static async userDetail(req, res) {
      try {
         let user;
         try {
            user = await userService.getUserById(String(req.query.id));
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('USER.DETAIL.SUCCESS'),
            payload: { user }
         });
      } catch (error) {
         logger.error(__filename, 'userDetail', req.custom.uuid, 'Error during get user detail', error);
         handleHTTPError({ error, res });
      }
   }

   static async updateUser(req, res) {
      try {
         let user;
         try {
            user = await userService.updateUser({ id: req.user._id, data: req.body });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
               case 'EMAIL_ALREADY_EXISTS':
                  throw new CustomError(['USER.ALREADY_REGISTER'], STATUS_CODES.CONFLICT);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('USER.UPDATE.SUCCESS'),
            payload: { user }
         });
      } catch (error) {
         logger.error(__filename, 'updateUser', req.custom.uuid, 'Error during update user', error);
         handleHTTPError({ error, res });
      }
   }

   static async userDelete(req, res) {
      try {
         try {
            await userService.deleteUser(String(req.query.id));
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('USER.DELETE.SUCCESS')
         });
      } catch (error) {
         logger.error(__filename, 'userDelete', req.custom.uuid, 'Error during delete user', error);
         handleHTTPError({ error, res });
      }
   }

   static async refreshToken(req, res) {
      try {
         let data;
         try {
            data = await userService.refreshToken({ refreshToken: req.body.refreshToken });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.UNAUTHORIZED);
               case 'USER_INACTIVE':
                  throw new CustomError(['USER.IN_ACTIVE'], STATUS_CODES.UNAUTHORIZED);
               case 'REFRESH_TOKEN_EXPIRED':
                  throw new CustomError(['AUTH.REFRESH_TOKEN_EXPIRED'], STATUS_CODES.UNAUTHORIZED);
               case 'REFRESH_TOKEN_INVALID':
                  throw new CustomError(['AUTH.REFRESH_TOKEN_INVALID'], STATUS_CODES.UNAUTHORIZED);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('AUTH.REFRESH_TOKEN.SUCCESS'),
            payload: data
         });
      } catch (error) {
         logger.error(__filename, 'refreshToken', req.custom.uuid, 'Error during refresh token', error);
         handleHTTPError({ error, res });
      }
   }

   static async resetPassword(req, res) {
      try {
         try {
            await userService.resetPassword({ resetToken: req.body.resetToken, newPassword: req.body.newPassword });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['USER.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
               case 'RESET_TOKEN_INVALID':
                  throw new CustomError(['AUTH.RESET_TOKEN_INVALID'], STATUS_CODES.BAD_REQUEST);
               default:
                  throw error;
            }
         }
         return createResponse({ res, status: STATUS_CODES.OK, message: req.__('AUTH.RESET_PASSWORD.SUCCESS') });
      } catch (error) {
         logger.error(__filename, 'resetPassword', req.custom.uuid, 'Error during reset password', error);
         handleHTTPError({ error, res });
      }
   }

   static async forgotPassword(req, res) {
      try {
         // no business errors to map: the service stays silent for unknown emails on purpose
         await userService.forgotPassword({ email: req.body.email });
         return createResponse({ res, status: STATUS_CODES.OK, message: req.__('AUTH.FORGOT_PASSWORD.SUCCESS') });
      } catch (error) {
         logger.error(__filename, 'forgotPassword', req.custom.uuid, 'Error during forgot password', error);
         handleHTTPError({ error, res });
      }
   }
}

module.exports = Controller;
