import path, { resolve } from "path";
import multer from "multer";
import {
  uploadFolder,
  cloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
} from "../config";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
  secure: true,
});

const storage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (request, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

export const cloudinaryUploader = (file, folder) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(file, { folder }, function (error, result) {
      if (error) console.warn(error);
      resolve(result);
    });
  });
};
export const multerUploader = multer({ storage });
