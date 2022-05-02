import mongoose from "mongoose";
import { Article, Category, Comment, Message, User } from "./models";
import { mongoUrl } from "./config";

const emptyDb = async () => {
  await mongoose.connect(mongoUrl);
  await Article.deleteMany();
  await Category.deleteMany();
  await Comment.deleteMany();
  await Message.deleteMany();
  await User.deleteMany();
  if (process.env.NODE_ENV !== "test") mongoose.disconnect();
};
export default emptyDb;
emptyDb();
