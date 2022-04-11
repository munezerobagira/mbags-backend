import dotenv from "dotenv";
import path from "path";
dotenv.config();
const environment = process.env.NODE_ENV;

let baseMongoUrl = process.env.MONGO_URL;

const cloudFolders = {
  articles: "articles",
  profiles: "profiles",
};

let envTag;

switch (environment && environment.toLowerCase()) {
  //make sure db are different for each environment
  case "development":
    envTag = "-dev";
    break;
  case "test":
    envTag = "-test";
    break;
  case "production":
    envTag = "";
    break;
  default:
  // baseMongoUrl;
}

// Make sure that resources are different for each environment
baseMongoUrl += envTag;
for (let key in cloudFolders) {
  cloudFolders[key] += envTag;
}
export const cloudinaryFolders = cloudFolders;
export const uploadFolder = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "temps"
);
export const port = process.env.PORT || 5000;
export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
export const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
export const cloudName = process.env.CLOUD_NAME;
export const mongoUrl = baseMongoUrl;
