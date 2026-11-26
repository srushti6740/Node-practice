const fs = require('fs');
const fsPromises = require('fs').promises;

const path = require('path');
const CustomError = require('./customError');
const { STATUS_CODES } = require('http');
const { BASE_URL, IMGPATH } = require('./constants');

const uploadImage = async (image, uploadDir) => {
   if (!image || !image.name || !image.mv) {
      throw new CustomError(['IMAGE.INVALID'], STATUS_CODES.BAD_REQUEST);
   }

   const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

   const extension = path.extname(image.name).toLowerCase();

   if (!allowedExtensions.includes(extension)) {
      throw new CustomError(['IMAGE.EXTENTION'], STATUS_CODES.BAD_REQUEST);
   }

   if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
   }

   const imageName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

   const uploadPath = path.join(uploadDir, imageName);

   await image.mv(uploadPath);

   return `${BASE_URL}/${IMGPATH}/${imageName}`;
};

const deleteImage = async (imageUrl) => {
   if (!imageUrl) {
      return;
   }

   try {
      await fsPromises.unlink(imageUrl);
      console.log("🚀 ~ deleteImage ~ imageUrl:", imageUrl)
 
   } catch (error) {
      if (error.code === 'ENOENT') {
         console.log('Image does not exist:', imageUrl);
         return;
      }

      throw error;
   }
};

module.exports = { uploadImage, deleteImage };
