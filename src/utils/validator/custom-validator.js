const { REGEXP } = require('../constants');

/** @description true when value is undefined / null / "null" / "undefined" / empty object / blank string */
const isEmpty = (value) =>
   value === undefined ||
   value === null ||
   value === 'null' ||
   value === 'undefined' ||
   (typeof value === 'object' && Object.keys(value).length === 0) ||
   (typeof value === 'string' && value.trim().length === 0);

const isNullish = (value) => value === undefined || value === null;

const isString = (value) => typeof value === 'string';

/** @description String that only has alphabets */
const isValidString = (str) => typeof str === 'string' && /^[a-zA-Z]+$/.test(str);

const customRegex = (str, regEx) => typeof str === 'string' && regEx.test(str);

const isEmail = (email) => customRegex(email, REGEXP.EMAIL_ADDRESS_REGEXP);

const isNumber = (value) => value !== '' && value !== null && Number.isInteger(Number(value));

const isDecimalNumber = (value) => value !== '' && value !== null && !isNaN(Number(value));

const isBoolean = (value) => value === true || value === false || value === 'true' || value === 'false';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isUUID = (value) =>
   typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isValidDate = (value) => !isNaN(new Date(value).getTime());

module.exports = {
   isEmpty,
   isNullish,
   isString,
   isValidString,
   customRegex,
   isEmail,
   isNumber,
   isDecimalNumber,
   isBoolean,
   isObject,
   isUUID,
   isValidDate
};
