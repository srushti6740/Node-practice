const { userModel } = require('../model');

/**
 * Data access only. No business rules here.
 */
class UserRepository {
   /** with password (needed for login) */
   findUserByEmail(email) {
      return userModel.findOne({ email: String(email) });
   }

   findByEmail(email) {
      return userModel.findOne({ email: String(email).toLowerCase(), deletedAt: null });
   }

   emailTaken(email, excludeId) {
      const condition = { email: String(email).toLowerCase(), deletedAt: null };
      if (excludeId) condition._id = { $ne: excludeId };
      return userModel.exists(condition);
   }

   /** without password */
   findById(id) {
      return userModel.findOne({ _id: id, deletedAt: null }).select('-password').lean();
   }

   findUserById(id) {
      return userModel.findOne({ _id: id, deletedAt: null });
   }

   create(data) {
      return userModel.create(data);
   }

   async saveOtp({ email, otp, expiresAt }) {
      return userModel.findOneAndUpdate(
         { email: String(email).toLowerCase(), deletedAt: null },
         { $set: { otp: String(otp), expiresAt, attempts: 0, isVerified: false } },
         { new: true }
      );
   }

   findOtp(email) {
      return userModel.findOne({ email: String(email).toLowerCase() });
   }

   incrementOtpAttempts(id) {
      return userModel.updateOne({ _id: id }, { $inc: { attempts: 1 } });
   }

   markOtpVerified(id) {
      return userModel.updateOne(
         { _id: id },
         { $set: { isActive: true, isVerified: true }, $unset: { otp: '', expiresAt: '' } }
      );
   }

   deleteOtps(email) {
      return userModel.updateOne(
         { email: String(email).toLowerCase(), deletedAt: null },
         { $unset: { otp: '', expiresAt: '' }, $set: { isVerified: false, attempts: 0 } }
      );
   }

   clearOtp(id) {
      return userModel.updateOne(
         { _id: id },
         { $unset: { otp: '', expiresAt: '' }, $set: { isVerified: false, attempts: 0 } }
      );
   }

   updateById(id, update) {
      return userModel
         .findOneAndUpdate({ _id: id, deletedAt: null }, { $set: update }, { new: true })
         .select('-password')
         .lean();
   }

   updatePassword(id, hashedPassword) {
      return userModel.updateOne({ _id: id }, { $set: { password: hashedPassword } });
   }

   updateUserPassword(id, hashedPassword) {
      return this.updatePassword(id, hashedPassword);
   }

   async findAll({ condition, orderBy, skip, limit }) {
      const [rows, total] = await Promise.all([
         userModel.find(condition).select('-password').sort(orderBy).skip(skip).limit(limit).lean(),
         userModel.countDocuments(condition)
      ]);
      return { rows, total };
   }

   /** soft delete */
   softDelete(id) {
      return userModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } });
   }
}

module.exports = new UserRepository();
