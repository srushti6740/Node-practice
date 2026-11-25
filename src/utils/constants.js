const HTTP_STATUS = {
   SUCCESS: 200,
   UNAUTHORIZED: 401,
   FORBIDDEN: 403,
   NOT_FOUND: 404,
   UNPROCESSED: 422,
   SERVER_ERROR: 500
};

const PAGINATION = {
   SORT_BY: 'createdAt',
   SORT_ORDER: 'desc',
   PAGE_NUMBER: 1,
   SKIP: 0,
   TAKE: 10,
   RECORDS_PER_PAGE: 10
};

const BASE_PATH = __dirname + '/../../'; // path till the project directory

const ROUTE_PREFIX_V1 = '/api/v1';
const ROUTE_PREFIX_V2 = '/api/v2';
const ROUTE_URL = '';

const REGEXP = {
   PASSWORD_REGEXP: /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z])(.{8,}))$/,
   ALPHA_NUMERIC_REGEXP: /^[A-Za-z0-9 ]*$/,
   ALPHABETS_REGEXP: /^[A-Za-z ]*$/,
   EMAIL_ADDRESS_REGEXP: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
   DATE_FORMAT: /^\d{4}-\d{1,2}-\d{1,2}$/
};

const USER_ROLE = {
   ADMIN: 'admin',
   USER: 'user'
};

const OTP_VALID_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRES = '15m';
const TOKEN_TYPE = { REFRESH: 'refresh', RESET: 'reset' };

const BASE_URL = 'localhost:8181';
const IMGPATH = 'uploads/categories';

module.exports = {
   HTTP_STATUS,
   PAGINATION,
   BASE_PATH,
   ROUTE_PREFIX_V1,
   ROUTE_PREFIX_V2,
   ROUTE_URL,
   REGEXP,
   USER_ROLE,
   OTP_VALID_MINUTES,
   MAX_OTP_ATTEMPTS,
   RESET_TOKEN_EXPIRES,
   TOKEN_TYPE,
   BASE_URL,
   IMGPATH
};
