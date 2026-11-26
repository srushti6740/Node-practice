const mongoose = require('mongoose');

const { Schema } = mongoose;

const taskAssiSchema = new Schema({
   taskId: {
      type: mongoose.Types.ObjectId,
      ref: 'task',
      required: true
   },
   userId: [
      {
         type: mongoose.Types.ObjectId,
         ref: 'user'
      }
   ],
   status: { type: String, enum: Object.values(TASK_STATUS), default: TASK_STATUS.PENDING },

   assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true    
   },

   assignedAt: {
      type: Date,
      default: Date.now
   }
});

module.exports = mongoose.Model('taskassi', taskAssiSchema);
