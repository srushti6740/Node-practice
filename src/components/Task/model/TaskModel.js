const mongoose = require('mongoose');
const { TASK_STATUS, PRIORITE } = require('../../../utils/constants');
const { Schema } = mongoose;

const taskSchema = new Schema(
   {
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      createdBy: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
      status: { type: String, enum: Object.values(TASK_STATUS), default: TASK_STATUS.PENDING },
      priority: { type: String, enum: Object.values(PRIORITE), default: PRIORITE.LOW },
      dueDate: { type: Date, default: null }
   },
   { timestamps: true }
);

module.exports = mongoose.Model('task', taskSchema);
