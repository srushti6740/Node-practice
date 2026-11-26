const mongoose = require('mongoose');
const fs = require('fs');
const categoryRepository = require('./CategoryRepository');
const ServiceError = require('../../../utils/serviceError');
const path = require('path');
const CustomError = require('../../../utils/customError');
const { uploadImage, deleteImage } = require('../../../utils/fileUpload');
const { escapeRegex } = require('../../../utils/helper');

class CategoryService {
   async createCategory({ name, description, image, main_category_id }) {
      const existCategory = await categoryRepository.findByName(name);
      if (existCategory) {
         throw new ServiceError('CATEGORY_ALREADY_EXISTS');
      }

      if (main_category_id) {
         if (!mongoose.Types.ObjectId.isValid(main_category_id)) {
            throw new ServiceError('CATEGORY_NOT_FOUND');
         }

         const mainCategory = await categoryRepository.findById(main_category_id);
         if (!mainCategory) {
            throw new ServiceError('CATEGORY_NOT_FOUND');
         }
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'categories');

      const imageUrl = image ? await uploadImage(image, uploadDir) : null;

      const category = await categoryRepository.create({
         name,
         description,
         image: imageUrl,
         main_category_id: main_category_id
      });

      return {
         message: 'STATUS_CODES.OK',
         category
      };
   }

   async updateCategory({ id, data, file }) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const existCategory = await categoryRepository.findById(id);
      if (!existCategory) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      const update = {};

      if (data.name !== undefined) {
         const name = String(data.name).trim();
         const exists = await categoryRepository.findByNameExceptId(name, id);

         if (exists) {
            throw new ServiceError('NAME_ALREADY_EXISTS');
         }
         update.name = name;
      }
      if (data.description !== undefined) {
         update.description = data.description;
      }
      if (data.main_category_id !== undefined) {
         update.main_category_id = data.main_category_id === '' ? null : data.main_category_id;
      }

      if (file) {
         const uploadDir = path.join(process.cwd(), 'uploads', 'categories');

         const imageUrl = await uploadImage(file, uploadDir);

         update.image = imageUrl;
      }

      const category = await categoryRepository.updateById(id, update);
      if (!category) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      if (file && existCategory.image) {
         const oldImagePath = path.join(
            process.cwd(),
            'uploads',
            'categories',
            path.basename(new URL(existCategory.image).pathname)
         );
         await deleteImage(oldImagePath);
      }

      const subcategories = await categoryRepository.findSubCategories(category._id);
      return { ...category, subcategories };
   }

   async getCategoryById(id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      const category = await categoryRepository.findById(id);
      if (!category) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const subcategories = await categoryRepository.findSubCategories(category._id);

      return { ...category.toObject(), subcategories };
   }

   async getCategoryList({ filters = {}, sortBy, sortOrder, pageNumber, recordsPerPage }) {
      const SORTABLE_FIELDS = ['createdAt', 'name'];
      const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
      const orderBy = { [sortField]: String(sortOrder).toLowerCase() === 'asc' ? 1 : -1 };

      const condition = { deletedAt: null };

      condition.main_category_id = null;
      const SEARCH_FIELDS = ['name', 'description'];

      for (const key of SEARCH_FIELDS) {
         const value = filters[key];

         if (typeof value !== 'string' || !value.trim()) {
            continue;
         }

         condition[key] = {
            $regex: escapeRegex(value.trim()),
            $options: 'i'
         };
      }
      const { fromDate, toDate } = filters;
      if (fromDate || toDate) {
         condition.createdAt = {};
         if (fromDate) {
            const startDate = new Date(`${fromDate}T00:00:00.000Z`);
            if (Number.isNaN(startDate.getTime())) {
               throw new ServiceError('INVALID_DATE');
            }

            condition.createdAt.$gte = startDate;
         }
         if (toDate) {
            const endDate = new Date(`${endDate}T00:00:00.000Z`);
            if (Number.isNaN(endDate.getTime())) {
               throw new ServiceError('INVALID_DATE');
            }

            endDate.setUTCDate(endDate.getUTCDate() + 1);
            condition.createdAt.$lt = endDate;
         }
         if (fromDate && toDate && fromDate > toDate) {
            throw new ServiceError('INVALID_DATE');
         }
      }

      const { rows, total } = await categoryRepository.findAll({
         condition,
         orderBy,
         skip: (pageNumber - 1) * recordsPerPage,
         limit: recordsPerPage
      });
      return {
         category: await Promise.all(
            rows.map(async (category) => ({
               ...category.toObject(),
               subCategories: await categoryRepository.findSubCategories(category._id)
            }))
         ),
         total,
         sortField
      };
   }

   async deleteCategory(id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const category = await categoryRepository.findById(id);

      if (!category) {
         throw new ServiceError('DATA_NOT_EXIST');
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'categories');

      const subcategories = !category.main_category_id ? await categoryRepository.findSubCategories(category._id) : [];

      if (!category.main_category_id) {
         await categoryRepository.softDeleteSubCategories(category._id);
      }

      // Soft delete
      const deleteCategory = await categoryRepository.softDelete(id);

      if (!deleteCategory) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      const categoriesToDelete = [category, ...subcategories];

      const imagePath = categoriesToDelete
         .filter((item) => item.image)
         .map((item) => path.join(uploadDir, path.basename(item.image.split('?')[0])));

      await Promise.all(imagePath.map((imagePath) => deleteImage(imagePath)));

      return true;
   }
}

module.exports = new CategoryService();
