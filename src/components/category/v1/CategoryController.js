const STATUS_CODES = require('http-status-codes');
const CustomError = require('../../../utils/customError');
const ServiceError = require('../../../utils/serviceError');
const { logger } = require('../../../utils/logger');

const { createResponse, handleHTTPError } = require('../../../utils/helper');
const categoryService = require('./CategoryService');

class Controller {
   static async createCategory(req, res) {
      try {
         const { name, description } = req.body;

         const main_category_id = req.body.main_category_id?.trim() || null;
         const image = req.files?.image || null;

         let category;

         try {
            category = await categoryService.createCategory({
               name,
               description,
               image,
               main_category_id
            });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }

            switch (error.error) {
               case 'CATEGORY_ALREADY_EXISTS':
                  throw new CustomError(['CATEGORY.ALREADY_CREATED'], STATUS_CODES.CONFLICT);

               case 'CATEGORY_NOT_FOUND':
                  throw new CustomError(['CATEGORY.NOT_EXIST'], STATUS_CODES.NOT_FOUND);

               default:
                  throw error;
            }
         }

         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('CATEGORY.CREATE.SUCCESS'),
            payload: { category }
         });
      } catch (error) {
         logger.error(__filename, 'createCategory', req.custom.uuid, 'Error during create category', error);

         return handleHTTPError({ error, res });
      }
   }

   static async updateCategory(req, res) {
      try {
         let category;
         try {
            category = await categoryService.updateCategory({ id: req.user._id, data: req.body });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['CATEGORY.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
               case 'NAME_ALREADY_EXISTS':
                  throw new CustomError(['CATEGORY.ALREADY_EXIST'], STATUS_CODES.CONFLICT);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('CATEGORY.UPDATE.SUCCESS'),
            payload: { category }
         });
      } catch (error) {
         logger.error(__filename, 'updateCategory', req.custom.uuid, 'Error during update category', error);
         handleHTTPError({ error, res });
      }
   }

   static async categoryDetail(req, res) {
      try {
         let category;
         try {
            category = await categoryService.getCategoryById(String(req.query.id));
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['CATEGORY.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('CATEGORY.DETAIL.SUCCESS'),
            payload: { category }
         });
      } catch (error) {
         logger.error(__filename, 'categoryDetail', req.custom.uuid, 'Error during get category detail', error);
         handleHTTPError({ error, res });
      }
   }
}
module.exports = Controller;
