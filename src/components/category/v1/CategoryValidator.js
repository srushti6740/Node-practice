const { createValidationResponse } = require('../../../utils/helper');
const { isEmpty, isString, isObject } = require('../../../utils/validator');
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

   static updateCategory(req, res, next) {
      const { id } = req.query;
      const data = req.body;
      const errors = {};
      const fields = ['name', 'description', 'main_category_id'];

      if (isEmpty(id)) {
         errors.id = req.__('VALIDATIONS.required', 'id');
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
         errors.id = req.__('VALIDATIONS.invalid', 'id');
      }

      if (!isObject(data)) {
         errors.body = req.__('VALIDATIONS.required', 'Update data');
      } else {
         const hasUpdateField = fields.some((field) => data[field] !== undefined);
         if (!hasUpdateField && !req.files?.image) {
            errors.body = req.__('VALIDATIONS.required', 'Update data');
         }

         ['name', 'description'].forEach((field) => {
            if (data[field] !== undefined && (isEmpty(data[field]) || !isString(data[field]))) {
               errors[field] = req.__('VALIDATIONS.invalid', field);
            }
         });

         const { main_category_id } = data;
         if (
            main_category_id !== undefined &&
            main_category_id !== null &&
            main_category_id !== '' &&
            (!isString(main_category_id) || !mongoose.Types.ObjectId.isValid(main_category_id))
         ) {
            errors.main_category_id = req.__('VALIDATIONS.invalid', 'Main Category');
         }
      }

      finish(errors, res, next);
   }
}

module.exports = Validator;
