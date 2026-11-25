const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
   fs.mkdirSync(logDir, { recursive: true });
}

const line = format.printf(({ level, message, timestamp, label }) => `${timestamp} [${level}] ${label || ''} ${message}`);

const baseLogger = createLogger({
   level: process.env.LOG_LEVEL || 'silly',
   format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.errors({ stack: true }), line),
   transports: [
      new transports.Console({ format: format.combine(format.colorize(), format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), line) }),
      new transports.DailyRotateFile({
         filename: path.join(logDir, 'logs_%DATE%.log'),
         datePattern: 'YYYY-MM-DD',
         maxSize: '16m',
         maxFiles: '30d',
         zippedArchive: true
      })
   ]
});

// "folder/file.js" from an absolute path, used as label in logs
const getLabel = (fileName = '') => {
   const parts = String(fileName).split(/[\\/]/);
   return parts.length > 1 ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}` : parts[0];
};

// CustomError = expected business/client error (4xx): no stack trace needed
const isClientError = (data) => data && data.name === 'CustomError' && Number(data.statusCode) < 500;

const stringify = (data) => {
   if (!data) return '';
   if (isClientError(data)) return `[${data.error.join(' ')}] status=${data.statusCode}`;
   if (data instanceof Error) return data.stack || data.message;
   if (typeof data === 'object') {
      try {
         return JSON.stringify(data);
      } catch (e) {
         return String(data);
      }
   }
   return String(data);
};

const write = (level) => (fileName, method, uuid, msg, data) => {
   const label = getLabel(fileName) + (method ? ' ~ ' + method : '');
   if (level === 'error' && isClientError(data)) level = 'warn';
   baseLogger.log(level, `${uuid ? uuid + ' - ' : ''}${msg} ${stringify(data)}`, { label });
};

/**
 * Usage: logger.info(__filename, 'methodName', req.custom.uuid, 'message', data)
 */
const logger = {
   error: write('error'),
   warn: write('warn'),
   info: write('info'),
   verbose: write('verbose'),
   debug: write('debug'),
   silly: write('silly')
};

module.exports = { logger };
