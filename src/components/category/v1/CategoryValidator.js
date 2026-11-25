const { createValidationResponse } = require('../../../utils/helper');
const { isEmpty } = require('../../../utils/validator');
const ServiceError = require('../../../utils/serviceError');
const mongoose = require('mongoose');

const finish = (errors, res, next) => {
   if (Object.keys(errors).length > 0) {
      return createValidationResponse(res, errors);
   }
   next();
};

class Validator {
   static createCategory(req, res, next) {
      const { name, description, main_category_id } = req.body;
      const errors = {};

      if (isEmpty(name)) {
         errors.name = req.__('VALIDATIONS.required', 'Name');
      } else if (isEmpty(description)) {
         errors.description = req.__('VALIDATIONS.required', 'Description');
      }

      if (main_category_id && !mongoose.Types.ObjectId.isValid(main_category_id)) {
         throw new ServiceError('CATEGORY_NOT_FOUND');
      }

      if (Object.keys(errors).length > 0) {
         return createValidationResponse(res, errors);
      }
      next();
   }

   static categoryDetail(req, res, next) {
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
