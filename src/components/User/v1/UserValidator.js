const { createValidationResponse } = require('../../../utils/helper');
const { isEmpty, isEmail, isString } = require('../../../utils/validator');

const finish = (errors, res, next) => {
   if (Object.keys(errors).length > 0) {
      return createValidationResponse(res, errors);
   }
   next();
};

class Validator {
   static createUser(req, res, next) {
      const { first_name, last_name, email, password } = req.body;
      const errors = {};

      if (isEmpty(first_name)) {
         errors.first_name = req.__('VALIDATIONS.required', 'First Name');
      } else if (isEmpty(last_name)) {
         errors.last_name = req.__('VALIDATIONS.required', 'Last Name');
      } else if (isEmpty(email)) {
         errors.email = req.__('VALIDATIONS.required', 'Email');
      } else if (!isEmail(email)) {
         errors.email = req.__('VALIDATIONS.invalid', 'Email');
      } else if (isEmpty(password)) {
         errors.password = req.__('VALIDATIONS.required', 'Password');
      }

      if (Object.keys(errors).length > 0) {
         return createValidationResponse(res, errors);
      }
      next();
   }

   static verifyOTP(req, res, next) {
      const { email, otp } = req.body;
      const errors = {};

      if (isEmpty(email)) {
         errors.email = req.__('VALIDATIONS.required', 'Email');
      } else if (isEmpty(otp)) {
         errors.otp = req.__('VALIDATIONS.required', 'OTP');
      }
      finish(errors, res, next);
   }

   static userLogin(req, res, next) {
      const { email, password } = req.body;
      const errors = {};

      if (isEmpty(email)) {
         errors.email = req.__('VALIDATIONS.required', 'Email');
      } else if (isEmpty(password)) {
         errors.password = req.__('VALIDATIONS.required', 'Password');
      }

      if (Object.keys(errors).length > 0) {
         return createValidationResponse(res, errors);
      }
      next();
   }

   static forgotPassword(req, res, next) {
      const { email } = req.body;
      const errors = {};

      if (isEmpty(email)) {
         errors.email = req.__('VALIDATIONS.required', 'Email');
      }
      finish(errors, res, next);
   }

   static resetPassword(req, res, next) {
      const { resetToken, newPassword } = req.body;
      const errors = {};

      if (isEmpty(resetToken) || !isString(resetToken)) {
         errors.resetToken = req.__('VALIDATIONS.required', 'Reset Token');
      } else if (isEmpty(newPassword) || !isString(newPassword)) {
         errors.newPassword = req.__('VALIDATIONS.required', 'New Password');
      } else if (newPassword.length < 8) {
         errors.newPassword = req.__('VALIDATIONS.invalid', 'New Password');
      }
      finish(errors, res, next);
   }

   static refreshToken(req, res, next) {
      const { refreshToken } = req.body;
      const errors = {};

      if (isEmpty(refreshToken) || !isString(refreshToken)) {
         errors.refreshToken = req.__('VALIDATIONS.required', 'Refresh Token');
      }
      finish(errors, res, next);
   }

   static userDetail(req, res, next) {
      const errors = {};

      if (isEmpty(req.query.id)) {
         errors.id = req.__('VALIDATIONS.required', 'id');
      }

      if (Object.keys(errors).length > 0) {
         return createValidationResponse(res, errors);
      }
      next();
   }
}

module.exports = Validator;
