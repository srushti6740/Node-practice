const STATUS_CODES = require('http-status-codes');
const CustomError = require('../../../utils/customError');
const ServiceError = require('../../../utils/serviceError');
const { logger } = require('../../../utils/logger');
const mongoose = require('mongoose');
const TaskService = require('../v1/TaskService');
const {
   createResponse,
   handleHTTPError,
   getPageNumber,
   getRecordsPerPage,
   getSortOrder,
   getSortBy
} = require('../../../utils/helper');

class Controller {
   static async createTaskCtrl(req, res) {
      try {
         const { title, description, priority, dueDate } = req.body;

         let task;
         try {
            task = await TaskService.createTask({
               title,
               description,
               priority,
               dueDate,
               createdBy: req.user._id
            });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }
            switch (error.error) {
               case 'TASK_ALREADY_EXISTS':
                  throw new CustomError(['TASK.ALREADY_CREATED'], STATUS_CODES.CONFLICT);

               case 'TASK_NOT_FOUND':
                  throw new CustomError(['TASK.NOT_EXIST'], STATUS_CODES.NOT_FOUND);

               default:
                  throw error;
            }
         }
         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('TASK.CREATE.SUCCESS'),
            payload: { task }
         });
      } catch (error) {
         logger.error(__filename, 'createCategory', req.custom.uuid, 'Error during create category', error);

         return handleHTTPError({ error, res });
      }
   }

   static async updateTaskCtrl(req, res) {
      try {
         let task;

         try {
            task = await TaskService.updateTask({
               id: String(req.query.id),
               data: req.body
            });
         } catch (error) {
            if (!(error instanceof ServiceError)) {
               throw error;
            }

            switch (error.error) {
               case 'DATA_NOT_EXIST':
                  throw new CustomError(['TASK.NOT_EXIST'], STATUS_CODES.NOT_FOUND);

               case 'NAME_ALREADY_EXISTS':
                  throw new CustomError(['TASK.ALREADY_EXIST'], STATUS_CODES.CONFLICT);

               default:
                  throw error;
            }
         }

         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('TASK.UPDATE.SUCCESS'),
            payload: { task }
         });
      } catch (error) {
         logger.error(__filename, 'updateTaskCtrl', req.custom.uuid, 'Error during update task', error);

         return handleHTTPError({ error, res });
      }
   }

   static async taskDetail(req, res) {
      let task;
      try {
         task = await TaskService.getTaskById(String(req.query.id));
      } catch (error) {
         if (!(error instanceof ServiceError)) {
            throw error;
         }
         switch (error.error) {
            case 'DATA_NOT_EXIST':
               throw new CustomError(['TASK.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
            default:
               throw error;
         }
      }
      return createResponse({
         res,
         status: STATUS_CODES.OK,
         message: req.__('TASK.DETAIL.SUCCESS'),
         payload: { task }
      });
   }

   static async taskList(req, res) {
      try {
         const pageNumber = getPageNumber(req);
         const recordsPerPage = getRecordsPerPage(req);
         const sortOrder = getSortOrder(req);

         const { tasks, sortField, total } = await TaskService.getTaskList({
            filters: req.query,
            sortBy: getSortBy(req),
            sortOrder,
            pageNumber,
            recordsPerPage
         });

         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('TASK.LIST.SUCCESS'),
            payload: { tasks },
            pager: {
               sortField,
               sortOrder,
               pageNumber,
               recordsPerPage,
               totalRecords: total
            }
         });
      } catch (error) {
         logger.error(__filename, 'taskList', req.custom.uuid, 'Error during get task list', error);

         return handleHTTPError({ error, res });
      }
   }

   static async taskDelete(req, res) {
      let task;
      try {
         task = await TaskService.deleteCategory(String(req.query.id));
      } catch (error) {
         if (!(error instanceof ServiceError)) {
            throw error;
         }
         switch (error.error) {
            case 'DATA_NOT_EXIST':
               throw new CustomError(['TASK.NOT_EXIST'], STATUS_CODES.NOT_FOUND);
            default:
               throw error;
         }
      }
      return createResponse({
         res,
         status: STATUS_CODES.OK,
         message: req.__('TASK.DELETE.SUCCESS')
      });
   }

   static async assignTask(req, res) {
      try {
         const { taskId, userIds  } = req.body;

         const assignments = await TaskService.assignTask({
            taskId,
            userIds,
            assignedBy: req.user._id
         });

         return createResponse({
            res,
            status: STATUS_CODES.OK,
            message: req.__('TASK.ASSIGN.SUCCESS'),
            payload: { assignments }
         });
      } catch (error) {
         logger.error(__filename, 'assignTask', req.custom.uuid, 'Error during get assign task', error);

         return handleHTTPError({ error, res });
      }
   }
}

module.exports = Controller;
