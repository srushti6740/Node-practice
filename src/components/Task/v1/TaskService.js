const TaskRepository = require('./TaskRepository');
const ServiceError = require('../../../utils/serviceError');
const mongoose = require('mongoose');
const UserRepository = require('../../User/v1/UserRepository');

class TaskService {
   async createTask(data) {
      const { title, description, priority, dueDate, createdBy } = data;

      const existTask = await TaskRepository.findByTitle(title);

      console.log('Existing task:', existTask);

      // Throw error only when task already exists
      if (existTask) {
         throw new ServiceError('TASK_ALREADY_EXISTS');
      }

      const task = await TaskRepository.create({
         title,
         description,
         priority,
         dueDate: dueDate || null,
         createdBy
      });

      return task;
   }

   async updateTask({ id, data }) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const existTask = await TaskRepository.findById(id);

      if (!existTask) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const update = {};

      if (data.title !== undefined) {
         const title = String(data.title).trim();

         if (!title) {
            throw new ServiceError('INVALID_TITLE');
         }

         const exists = await TaskRepository.findByTitleExceptId(title, id);

         if (exists) {
            throw new ServiceError('TITLE_ALREADY_EXISTS');
         }

         update.title = title;
      }

      if (data.description !== undefined) {
         update.description = data.description;
      }

      if (data.priority !== undefined) {
         update.priority = data.priority;
      }

      if (data.dueDate !== undefined) {
         update.dueDate = data.dueDate || null;
      }

      if (Object.keys(update).length === 0) {
         throw new ServiceError('NO_UPDATE_DATA');
      }

      const task = await TaskRepository.updateById(id, update);

      if (!task) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      return task;
   }

   async getTaskById(id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const task = await TaskRepository.findById(id);
      if (!task) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      return task;
   }

   async getTaskList({ filters = {}, sortBy, sortOrder, pageNumber, recordsPerPage }) {
      const SORTABLE_FIELDS = ['createdAt', 'name'];

      const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';

      const orderBy = {
         [sortField]: String(sortOrder).toLowerCase() === 'asc' ? 1 : -1
      };

      const condition = {};

      if (filters.priority) {
         condition.priority = filters.priority;
      }

      const skip = (pageNumber - 1) * recordsPerPage;

      const [tasks, total] = await Promise.all([
         TaskRepository.getTaskList({
            condition,
            orderBy,
            skip,
            recordsPerPage
         }),
         TaskRepository.countTasks(condition)
      ]);

      return {
         tasks,
         total,
         sortField
      };
   }

   async deleteCategory(id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      const task = await TaskRepository.findById(id);
      if (!task) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const deleteTask = await TaskRepository.softDelete(id);
      if (!deleteTask) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      return true;
   }

   async assignTask({ taskId, userIds, assignedBy }) {
      const task = await TaskRepository.findById(taskId);

      if (!task) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      console.log('Task ID:', taskId);
      console.log('Task found:', task);
      const users = await UserRepository.findByIds(userIds);
      if (!users) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      console.log('User ID:', userIds);
      console.log('User found:', users);
      if (users.length !== userIds.length) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const assignmentData = userIds.map((userId) => ({
         taskId,
         userId,
         assignedBy
      }));
      const assignments = await TaskRepository.createMany(assignmentData);
      return assignmentData;
   }
}

module.exports = new TaskService();
