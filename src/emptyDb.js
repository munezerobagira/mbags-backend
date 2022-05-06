import mongoose from "mongoose";
import { Article, Category, Comment, Message, Project, User } from "./models";
import { mongoUrl } from "./config";

const emptyDb = async () => {
  await mongoose.connect(mongoUrl);
  await Article.deleteMany();
  await Category.deleteMany();
  await Comment.deleteMany();
  await Message.deleteMany();
  await User.deleteMany();
  await Project.deleteMany();
  if (process.env.NODE_ENV !== "test") mongoose.disconnect();
};
export default emptyDb;
emptyDb();

