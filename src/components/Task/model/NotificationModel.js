const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationSchema = new Schema(
   {
      sender: {
         type: mongoose.Types.ObjectId,
         ref: 'user',
         required: true
      },
      receiver: {
         type: mongoose.Types.ObjectId,
         ref: 'user',
         required: true
      },
      task: {
         type: mongoose.Types.ObjectId,
         ref: 'task'
      },
      title: {
         type: String,
         required: true
      },
      message: {
         type: String,
         required: true
      },
      status: { type: String, enum: Object.values(TASK_STATUS), default: TASK_STATUS.PENDING },
      is_read: { type: Boolean, default: false }
   },
   { timestamps: true }
);

module.exports = mongoose.model('notification', notificationSchema);
