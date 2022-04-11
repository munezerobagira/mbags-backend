import dotenv from "dotenv";
import path from "path";
dotenv.config();
const environment = process.env.NODE_ENV;

let baseMongoUrl = process.env.MONGO_URL;
switch (environment && environment.toLocaleLowerCase()) {
  //make sure db are different for each environment
  case "development":
    baseMongoUrl += "-dev";
    break;
  case "test":
    baseMongoUrl += "-test";
    break;
  default:
    baseMongoUrl;
}
export const uploadFolder = path.join(__dirname, "..", "public", "uploads");
export const port = process.env.PORT || 5000;
export const mongoUrl = baseMongoUrl;
