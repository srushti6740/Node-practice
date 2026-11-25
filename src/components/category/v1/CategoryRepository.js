const { categoryModel } = require('../model');

/**
 * Data access only. No business rules here.
 */
class CategoryRepository {
   /** with password (needed for login) */
   findByName(name) {
      return categoryModel.findOne({ name: String(name).trim() });
   }

   findById(id) {
      return categoryModel.findOne({ _id: id, deletedAt: null });
   }

   create(data) {
      return categoryModel.create(data);
   }

   findAll() { 
      return categoryModel.find({
         deletedAt: null
      });
   }

   updateById(id, update) {
      return categoryModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: update }, { new: true }).lean();
   }

   /** soft delete */
   softDelete(id) {
      return categoryModel.findOneAndUpdate(
         { _id: id, deletedAt: null },
         { $set: { deletedAt: new Date() } },
         { new: true }
      );
   }
}

module.exports = new CategoryRepository();
