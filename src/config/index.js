import dotenv from "dotenv";
import path from "path";

dotenv.config();
const environment = process.env.NODE_ENV;

let baseMongoUrl = process.env.MONGO_URL;

const cloudFolders = {
  articles: "articles",
  profiles: "profiles",
  projects: "projects",
};

// Make sure that resources are different for each environment
baseMongoUrl += environment;
let key;
for (key in cloudFolders) {
  cloudFolders[key] += environment;
}
export const cloudinaryFolders = cloudFolders;
export const uploadFolder = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "temps"
);
export const logsFolder = path.join(__dirname, "..", "..", "logs");
const { PORT = 5000 } = process.env;
export const port = PORT;
export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
export const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
export const cloudName = process.env.CLOUD_NAME;
export const mongoUrl = baseMongoUrl;
export const tokenSecret = process.env.TOKEN_SECRET;
export const sendGridApiKey = process.env.SENDGRID_API_KEY;
export const verificationEmail = process.env.SEND_VERIFICATION_EMAIL;
export const replyToEmail = process.env.REPLY_TO_EMAIL;
export const host = process.env.HOST;
