import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

import {
  uploadFolder,
  cloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
} from "../config";
import Logger from "./Logger";

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
  secure: true,
});

const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (request, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

export const cloudinaryUploader = (file, folder) =>
  new Promise((resolve) => {
    cloudinary.uploader.upload(file, { folder }, (error, result) => {
      if (error) Logger.warn(error);
      resolve(result);
    });
  });
export const multerUploader = multer({ storage });

