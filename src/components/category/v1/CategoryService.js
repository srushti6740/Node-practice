const mongoose = require('mongoose');
const fs = require('fs');
const categoryRepository = require('./CategoryRepository');
const ServiceError = require('../../../utils/serviceError');
const path = require('path');
const CustomError = require('../../../utils/customError');
const { uploadImage } = require('../../../utils/fileUpload');

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
      if (data.image !== undefined) {
         update.image = data.image;
      }

      const category = await categoryRepository.updateById(id, update);
      if (!category) {
         throw new ServiceError('DATA_NOT_EXIST');
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

      const FILTER_FIELDS = ['name', 'description'];
      const REGEX_FILTERS = ['name'];

      for (const key of FILTER_FIELDS) {
         const value = filters[key];
         if (value === undefined || typeof value !== 'string' || value === '') continue;
         else if (REGEX_FILTERS.includes(key)) condition[key] = { $regex: escapeRegex(value), $options: 'i' };
         else condition[key] = value;
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
}

module.exports = new CategoryService();
