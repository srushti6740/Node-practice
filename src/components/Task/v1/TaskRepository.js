const TaskassignModel = require('../model/TaskassignModel');
const TaskModel = require('../model/TaskModel');

class TaskRepository {
   findByTitle(title) {
      return TaskModel.findOne({
         title: String(title).trim()
      });
   }

   create(data) {
      return TaskModel.create(data);
   }

   findById(id) {
      return TaskModel.findById(id).lean();
   }

   findByTitleExceptId(title, id) {
      return TaskModel.findOne({
         title: String(title).trim(),
         _id: { $ne: id }
      }).lean();
   }

   updateById(id, update) {
      return TaskModel.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
   }

   softDelete(id) {
      return TaskModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } });
   }

   getTaskList({ condition, orderBy, skip, recordsPerPage }) {
      return TaskModel.find(condition).sort(orderBy).skip(skip).limit(recordsPerPage).lean();
   }

   countTasks(condition) {
      return TaskModel.countDocuments(condition);
   }

   createassignTask(data) {
      return TaskassignModel.create(data);
   }
   createMany(data) {
      return TaskassignModel.insertMany(data);
   }
}

module.exports = new TaskRepository();
