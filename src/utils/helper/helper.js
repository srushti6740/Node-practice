const jwt = require('jsonwebtoken');
const STATUS_CODES = require('http-status-codes');
const CustomError = require('../customError');
const errorCode = require('../errorCode');
const { logger } = require('../logger');
const { HTTP_STATUS, PAGINATION } = require('../constants');

const jwtKey = () => process.env.JWT_KEY || 'staticSecret';

/**
 * @description Create Response
 * @param {{res: object, status: number, message: string, payload?: object, pager?: object, code?: string}} options
 */
const createResponse = ({ message, payload = {}, res, status, pager, code }) => {
   pager = pager !== undefined ? pager : {};
   return res.status(Number(status)).json({ status, message, payload, pager, code });
};

/** @description Translate any thrown error to an HTTP response */
const handleHTTPError = ({ error, res }) => {
   if (error instanceof CustomError) {
      return createResponse({
         message: res.__(...error.error),
         res,
         status: error.statusCode,
         payload: error.data,
         code: error.code || errorCode.error
      });
   }
   return createResponse({
      message: res.__('SERVER_ERROR_MESSAGE'),
      res,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      payload: {},
      code: errorCode.internalServerError
   });
};

/** @description Send first validation error as 422 */
const createValidationResponse = (res, errors) => {
   logger.error(__filename, 'validations', '', 'validation errors', errors);
   const first = errors[Object.keys(errors)[0]];
   return createResponse({
      res,
      message: first,
      status: HTTP_STATUS.UNPROCESSED,
      payload: { error: first }
   });
};

/** JWT */
const createJWTToken = (data) => jwt.sign(data, jwtKey());

const createJWTTokenWithExpire = (data, expire) =>
   jwt.sign(data, jwtKey(), { expiresIn: expire || process.env.JWT_EXPIRES_IN || '72h' });

/** @param {string} token "Bearer xxx" */
const verifyJWTToken = (token) => jwt.verify(token.split(' ')[1], jwtKey());

const verifyJWTTokenWithoutBarer = (token) => jwt.verify(token, jwtKey());

/** Pagination helpers */
const getSortOrder = (req) => (req.query.sortOrder ? String(req.query.sortOrder) : PAGINATION.SORT_ORDER);
const getSortBy = (req) => (req.query.sortBy ? String(req.query.sortBy) : PAGINATION.SORT_BY);
const getPageNumber = (req) =>
   req.query.pageNumber ? Math.max(1, Number(req.query.pageNumber)) : PAGINATION.PAGE_NUMBER;
const getRecordsPerPage = (req) =>
   req.query.recordsPerPage ? Math.max(1, Number(req.query.recordsPerPage)) : PAGINATION.RECORDS_PER_PAGE;
const getDefaultSortOrder = (sortOrder) =>
   sortOrder && ['asc', 'desc'].includes(String(sortOrder).toLowerCase())
      ? String(sortOrder).toLowerCase()
      : PAGINATION.SORT_ORDER;

const escapeRegex = (str = '') => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseBooleanValue = (str) => str === true || str === 'true';

const randomStr = (length) => {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz';
   let out = '';
   for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
   return out;
};

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const getOtpExpire = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

module.exports = {
   createResponse,
   handleHTTPError,
   createValidationResponse,
   createJWTToken,
   createJWTTokenWithExpire,
   verifyJWTToken,
   verifyJWTTokenWithoutBarer,
   getSortOrder,
   getSortBy,
   getPageNumber,
   getRecordsPerPage,
   getDefaultSortOrder,
   escapeRegex,
   parseBooleanValue,
   randomStr,
   generateOTP,
   getOtpExpire
};
