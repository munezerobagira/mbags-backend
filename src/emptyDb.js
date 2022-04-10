import { Article, Category, Comment, Message } from "./models";
import { mongoUrl } from "./config";
import mongoose from "mongoose";
const emptyDb = async () => {
  await mongoose.connect(mongoUrl);
  await Article.deleteMany();
  await Category.deleteMany();
  await Comment.deleteMany();
  await Message.deleteMany();
  await mongoose.disconnect();
};

emptyDb();
