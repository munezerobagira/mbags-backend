import { Article, Category, Comment, Message, Project, User } from "./models";

const truncateDb = async () => {
  await Article.deleteMany();
  await Category.deleteMany();
  await Comment.deleteMany();
  await Message.deleteMany();
  await User.deleteMany();
  await Project.deleteMany();
  return true;
};
export default truncateDb;

