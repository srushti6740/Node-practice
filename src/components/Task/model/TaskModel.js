const mongoose = require('mongoose');
const { PRIORITE } = require('../../../utils/constants');
const { Schema } = mongoose;

const taskSchema = new Schema(
   {
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      createdBy: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
      priority: { type: String, enum: Object.values(PRIORITE), default: PRIORITE.LOW },
      dueDate: { type: Date, default: null },
      deletedAt: { type: Date, default: null },
      assignedTo: { type: mongoose.Types.ObjectId, ref: 'user' }
   },
   { timestamps: true }
);

taskSchema.pre('find', function (next) {
   this.where({ deletedAt: null });
   next();
});
taskSchema.pre('findOne', function (next) {
   this.where({ deletedAt: null });
   next();
});
taskSchema.pre('findOneAndUpdate', function (next) {
   this.where({ deletedAt: null });
   next();
});

module.exports = mongoose.model('task', taskSchema);
