const { createValidationResponse } = require('../../../utils/helper');
const { isEmpty, isString, isObject } = require('../../../utils/validator');
const ServiceError = require('../../../utils/serviceError');
const mongoose = require('mongoose');
class Validator {
   static createTask(req, res, next) {
      const { title, description, priority, dueDate } = req.body;
      const errors = {};

      if (isEmpty(title)) {
         errors.title = req.__('VALIDATIONS.required', 'Title');
      } else if (isEmpty(description)) {
         errors.description = req.__('VALIDATIONS.required', 'Description');
      } else if (isEmpty(priority)) {
         errors.priority = req.__('VALIDATIONS.required', 'Priority');
      } else if (isEmpty(dueDate)) {
         errors.dueDate = req.__('VALIDATIONS.required', 'Duedate');
      }
      if (Object.keys(errors).length > 0) {
         return createValidationResponse(res, errors);
      }
      next();
   }

   static updateTask(req, res, next) {
      const fields = [title, description, priority, dueDate];
   }

   static taskDetail(req, res, next) {
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
