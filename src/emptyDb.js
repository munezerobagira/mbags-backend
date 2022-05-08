import mongoose from "mongoose";
import { mongoUrl } from "./config";
import truncateDb from "./truncateDb";

(async () => {
  await mongoose.connect(mongoUrl);
  await truncateDb();
  await mongoose.disconnect();
})();

