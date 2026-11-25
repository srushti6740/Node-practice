const mongoose = require('mongoose');
const { USER_ROLE } = require('../../../utils/constants');

const { Schema } = mongoose;

const userSchema = new Schema(
   {
      first_name: { type: String, required: true, trim: true },
      last_name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      phone_code: { type: String },
      phone_number: { type: String },
      role: { type: String, enum: Object.values(USER_ROLE), default: USER_ROLE.USER },
      isActive: { type: Boolean, default: false },
      otp: { type: String }, // hashed
      attempts: { type: Number, default: 0 },
      expiresAt: { type: Date, index: { expires: 0 } },
      isVerified: { type: Boolean, default: false },
      deletedAt: { type: Date, default: null }
   },
   { timestamps: true }
);

module.exports = mongoose.model('user', userSchema);
