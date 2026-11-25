const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const userRepository = require('./UserRepository');
const ServiceError = require('../../../utils/serviceError');
const jwt = require('jsonwebtoken');
const {
   escapeRegex,
   parseBooleanValue,
   getOtpExpire,
   generateOTP,
   createJWTTokenWithExpire,
   verifyJWTTokenWithoutBarer
} = require('../../../utils/helper');
const EmailSendService = require('../../../services/emailSend');
const { logger } = require('../../../utils/logger');
const fs = require('fs');
const path = require('path');
const { OTP_VALID_MINUTES, MAX_OTP_ATTEMPTS, RESET_TOKEN_EXPIRES, TOKEN_TYPE } = require('../../../utils/constants');

const otpTemplatePath = path.join(__dirname, '../../../../public/emailTemplate/otp.html');
// const otpTemplatePath = "../../../../public/emailTemplate/otp.html"
const otpTemplate = fs.readFileSync(otpTemplatePath, 'utf8');

const withoutPassword = (user, token) => {
   const obj = user.toObject ? user.toObject() : { ...user };
   delete obj.password;
   return { user: obj, token };
};

/**
 * Business logic for User. Throws ServiceError, the controller maps it to an HTTP error.
 */
class UserService {
   async createUser({ first_name, last_name, email, password, phone_code, phone_number, role }) {
      const existEmail = await userRepository.emailTaken(email);
      if (existEmail) {
         throw new ServiceError('EMAIL_ALREADY_EXISTS');
      }

      const hashed = await bcrypt.hash(password, 10);

      const otp = generateOTP();

      const user = await userRepository.create({
         first_name,
         last_name,
         email,
         password: hashed,
         phone_code,
         phone_number,
         role,
         otp: otp, // Store plain OTP
         expiresAt: getOtpExpire(OTP_VALID_MINUTES),
         isActive: false
      });

      try {
         const html = otpTemplate
            .replace(/{{USER_NAME}}/g, first_name || 'User')
            .replace(/{{OTP}}/g, otp)
            .replace(/{{OTP_VALID_MINUTES}}/g, OTP_VALID_MINUTES);

         await EmailSendService.sendEmail({
            to: email,
            subject: 'Signup Verification OTP',
            html
         });
      } catch (error) {
         logger.error(__filename, 'createUser', '', 'Signup OTP mail could not be sent', error);

         // await userRepository.deleteById(user._id);

         throw new ServiceError('OTP_EMAIL_SEND_FAILED');
      }

      return {
         message: 'STATUS_CODES.OK',
         user: withoutPassword(user)
      };
   }

   async verifyOTP({ email, otp }) {
      try {
         const record = await userRepository.findOtp(email);
         if (!record) {
            throw new ServiceError('OTP_INVALID');
         }
         if (record.expiresAt < new Date()) {
            await userRepository.deleteOtps(email);
            throw new ServiceError('OTP_EXPIRED');
         }
         if (record.attempts >= MAX_OTP_ATTEMPTS) {
            await userRepository.deleteOtps(email);
            throw new ServiceError('OTP_ATTEMPTS_EXCEEDED');
         }
         if (record.otp !== otp) {
            await userRepository.incrementOtpAttempts(record._id);
            throw new ServiceError('OTP_INVALID');
         }

         const user = await userRepository.findUserByEmail(email);
         if (!user) {
            throw new ServiceError('DATA_NOT_EXIST');
         }

         await userRepository.markOtpVerified(record._id);
         const resetToken = createJWTTokenWithExpire({ _id: user._id, type: TOKEN_TYPE.RESET }, RESET_TOKEN_EXPIRES);
         return { resetToken };
      } catch (error) {}
   }

   async login({ email, password }) {
      const user = await userRepository.findByEmail(email);
      if (!user || !(await bcrypt.compare(String(password), user.password))) {
         throw new ServiceError('INVALID_CREDENTIALS');
      }

      if (!user.isActive) {
         throw new ServiceError('USER_INACTIVE');
      }

      const token = createJWTTokenWithExpire({ _id: user._id, role: user.role });
      const refreshToken = createJWTTokenWithExpire(
         { _id: user._id, type: TOKEN_TYPE.REFRESH },
         process.env.JWT_REFRESH_EXPIRES_IN || '24h'
      );
      return { ...withoutPassword(user, token), refreshToken };
   }

   async getUserList({ filters = {}, sortBy, sortOrder, pageNumber, recordsPerPage }) {
      const SORTABLE_FIELDS = ['createdAt', 'first_name', 'last_name', 'email'];
      const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
      const orderBy = { [sortField]: String(sortOrder).toLowerCase() === 'asc' ? 1 : -1 };

      const condition = { deletedAt: null };
      const FILTER_FIELDS = ['isActive', 'role', 'email', 'first_name', 'last_name'];
      const REGEX_FILTERS = ['email', 'first_name', 'last_name'];

      for (const key of FILTER_FIELDS) {
         const value = filters[key];
         if (value === undefined || typeof value !== 'string' || value === '') continue; // ignore operators/objects
         if (key === 'isActive') condition[key] = parseBooleanValue(value);
         else if (REGEX_FILTERS.includes(key)) condition[key] = { $regex: escapeRegex(value), $options: 'i' };
         else condition[key] = value;
      }

      const { rows, total } = await userRepository.findAll({
         condition,
         orderBy,
         skip: (pageNumber - 1) * recordsPerPage,
         limit: recordsPerPage
      });
      return { users: rows, total, sortField };
   }

   async getUserById(id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      const user = await userRepository.findById(id);
      if (!user) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      return user;
   }

   async updateUser({ id, data }) {
      const update = {};
      ['first_name', 'last_name', 'phone_code', 'phone_number'].forEach((key) => {
         if (data[key] !== undefined) update[key] = data[key];
      });

      if (data.email !== undefined) {
         if (await userRepository.emailTaken(data.email, id)) {
            throw new ServiceError('EMAIL_ALREADY_EXISTS');
         }
         update.email = data.email;
      }

      const user = await userRepository.updateById(id, update);
      if (!user) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      return user;
   }

   async deleteUser(id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      const user = await userRepository.softDelete(id);
      if (!user) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      return true;
   }

   async forgotPassword({ email }) {
      const user = await userRepository.findUserByEmail(email);
      if (!user || !user.isActive) {
         return;
      }

      const otp = generateOTP();
      await userRepository.saveOtp({
         email: user.email,
         otp: otp,
         expiresAt: getOtpExpire(OTP_VALID_MINUTES)
      });

      try {
         const html = otpTemplate
            .replace(/{{USER_NAME}}/g, user.first_name || 'User')
            .replace(/{{OTP}}/g, otp)
            .replace(/{{OTP_VALID_MINUTES}}/g, OTP_VALID_MINUTES);

         await EmailSendService.sendEmail({
            to: user.email,
            subject: 'Password reset OTP',
            html: html
         });
      } catch (error) {
         logger.error(__filename, 'forgotPassword', '', 'OTP mail could not be sent', error);
      }
   }

   async resetPassword({ resetToken, newPassword }) {
      let decoded;
      try {
         decoded = verifyJWTTokenWithoutBarer(resetToken);
      } catch (error) {
         throw new ServiceError('RESET_TOKEN_INVALID');
      }
      if (decoded.type !== TOKEN_TYPE.RESET) {
         throw new ServiceError('RESET_TOKEN_INVALID');
      }

      const user = await userRepository.findUserById(decoded._id);
      if (!user) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      // the OTP must have been verified and still be there (also makes the reset token single use)
      const record = await userRepository.findOtp(user.email);
      if (!record || !record.isVerified) {
         throw new ServiceError('RESET_TOKEN_INVALID');
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await userRepository.updateUserPassword(user._id, hashed);
      await userRepository.deleteOtps(user.email);
   }

   /** Exchanges a refresh token for a new access token */
   async refreshToken({ refreshToken }) {
      let decoded;
      try {
         decoded = verifyJWTTokenWithoutBarer(refreshToken);
      } catch (error) {
         if (error instanceof jwt.TokenExpiredError) {
            throw new ServiceError('REFRESH_TOKEN_EXPIRED');
         }
         throw new ServiceError('REFRESH_TOKEN_INVALID');
      }
      if (decoded.type !== TOKEN_TYPE.REFRESH) {
         throw new ServiceError('REFRESH_TOKEN_INVALID');
      }

      const user = await userRepository.findUserById(decoded._id);
      if (!user) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      if (!user.isActive) {
         throw new ServiceError('USER_INACTIVE');
      }

      return { token: createJWTTokenWithExpire({ _id: user._id, role: user.role }) };
   }
}

module.exports = new UserService();
