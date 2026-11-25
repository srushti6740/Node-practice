const mongoose = require('mongoose');
const fs = require('fs');
const categoryRepository = require('./CategoryRepository');
const ServiceError = require('../../../utils/serviceError');
const path = require('path');
const CustomError = require('../../../utils/customError');
const { STATUS_CODES } = require('http');
const { BASE_URL, IMGPATH } = require('../../../utils/constants');

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

      let imageName = null;
      let imageUrl = null;

      if (image) {
         // Check uploaded file
         if (!image.name || !image.mv) {
            throw new CustomError(['IMAGE.INVALID'], STATUS_CODES.NOT_FOUND);
         }

         // Allowed extensions
         const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

         const extension = path.extname(image.name).toLowerCase();

         if (!allowedExtensions.includes(extension)) {
            throw new CustomError(['IMAGE.EXTENTION'], STATUS_CODES.NOT_FOUND);
         }

         const uploadDir = path.join(process.cwd(), 'uploads', 'categories');

         if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
         }

         imageName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

         const uploadPath = path.join(uploadDir, imageName);

         await image.mv(uploadPath);

         imageUrl = `${BASE_URL}/${IMGPATH}/${imageName}`;
      }

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

   async updateCategory({ id, data }) {
      const update = {};
      ['name', 'description', 'main_category_id', 'image'].forEach((key) => {
         if (data[key] !== undefined) update[key] = data[key];
      });

      if (data.name !== undefined) {
         if (await categoryRepository.emailTaken(data.name, id)) {
            throw new ServiceError('NAME_ALREADY_EXISTS');
         }
         update.name = data.name;
      }

      const category = await categoryRepository.updateById(id, update);
      if (!category) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      return category;
   }

   async getCategoryById(id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      const user = await categoryRepository.findById(id);
      if (!user) {
         throw new ServiceError('DATA_NOT_EXIST');
      }
      return user;
   }
}

module.exports = new CategoryService();
