const { categoryModel } = require('../model');

/**
 * Data access only. No business rules here.
 */
class CategoryRepository {
   /** with password (needed for login) */
   findByName(name) {
      return categoryModel.findOne({ name: String(name).trim() });
   }

   findByNameExceptId(name, id) {
      return categoryModel.findOne({
         name: String(name).trim(),
         _id: { $ne: id },
         deletedAt: null
      });
   }

   findById(id) {
      return categoryModel.findOne({ _id: id, deletedAt: null });
   }

   create(data) {
      return categoryModel.create(data);
   }

   findSubCategories(mainCategoryId) {
      return categoryModel
         .find({
            main_category_id: mainCategoryId,
            deletedAt: null
         })
         .select('-createdAt -updatedAt -__v');
   }

   async findAll({ condition, orderBy, skip, limit }) {
      const [rows, total] = await Promise.all([
         categoryModel.find(condition).sort(orderBy).skip(skip).limit(limit),
         categoryModel.countDocuments(condition)
      ]);
      return { rows, total };
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
