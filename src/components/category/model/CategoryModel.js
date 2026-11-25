const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema(
   {
      name: {
         type: String,
         required: true,
         trim: true
      },
      description: {
         type: String,
         required: [true, 'Food Description is required!'],
         trim: true
      },
      image: {
         type: String,
         default: null
      },
      main_category_id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Category',
         default: null
      },
      deletedAt: {
         type: Date,
         default: null
      }
   },
   { timestamps: true }
);

module.exports = mongoose.model('category', categorySchema);
