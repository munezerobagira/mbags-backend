import { cloudinaryFolders } from "../config";
import { cloudinaryUploader } from "../helpers/uploader";
import { Article, Category, Comment } from "../models";

export default class ArticleServive {
  // Articles
  static async addArticle({
    title,
    summary,
    categories,
    content,
    authorId,
    image,
  }) {
    try {
      const uploadResult = await cloudinaryUploader(
        image,
        cloudinaryFolders.articles
      );
      if (!uploadResult) return { succes: false, error: "Image upload error" };
      const article = new Article({
        title,
        summary,
        content,
        authorId,
        images: [
          {
            path: uploadResult.secure_url || uploadResult.url,
            width: uploadResult.width,
            height: uploadResult.height,
          },
        ],
      });
      await article.save();
      if (categories) {
        categories = categories.split(",").map((tag) => tag.trim());
        for (let tag of categories) {
          tag = tag[0].toUpperCase() + tag.slice(1).toLowerCase();
          let category = await Category.findOne({ title: tag });
          if (!category) category = new Category({ title: tag, articles: [] });
          category.articles.push(article._id);
          await category.save();
          article.categories.push(category._id);
        }
        await article.save();
      }
      return { success: true, article };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async updateArticle(
    id,
    { title, summary, categories, content, featured, published, authorId }
  ) {
    try {
      const article = await Article.findOne({ _id: id });
      if (!article) return { success: false, error: "Article not found" };
      if (title) article.title = title;
      if (summary) article.summary = summary;
      if (content) article.summary = summary;
      if (published) article.published = !!published;
      if (featured) article.featured = !!featured;
      if (categories) {
        article.categories.forEach(async (categoryId) => {
          let category = await Category.findOne({ _id: categoryId });
          if (!category) return;
          category.articles.pull(id);
          await category.save();
        });
        article.categories = [];
        await article.save();
        categories = categories.split(",").map((tag) => tag.trim());
        for (let tag of categories) {
          tag = tag[0].toUpperCase() + tag.slice(1).toLowerCase();
          let category = await Category.findOne({ title: tag });
          if (!category) category = new Category({ title: tag, articles: [] });
          if (!category.articles.includes(article._id))
            category.articles.push(article._id);
          await category.save();
          article.categories.push(category._id);
        }
        await article.save();
      }

      await article.save();
      return { success: true, article };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async getArticles({ count = 100, skip = 0, ...filter }) {
    try {
      let articles;
      if (!filter) filter = {};
      articles = await Article.find(filter)
        .limit(count)
        .skip(count * skip);
      if (!articles) return { success: false, error: "Articles not found" };
      return { success: true, articles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async getArticle(id) {
    try {
      const article = await Article.findOne({ _id: id })
        .populate("comments")
        .populate({ path: "categories", options: { select: "title" } });
      if (!article) return { success: false, error: "Article not found" };
      return { success: true, article };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async deleteArticle(id) {
    try {
      const article = await Article.findOneAndDelete({ _id: id });
      if (!article) return { success: false, error: "Article not found" };
      if (article.comments)
        article.comments.forEach(async (commentId) => {
          let comment = await Comment.findOneAndDelete(commentId);
          //experimental
          while (comment.reply) {
            comment = await Comment.findOneAndDelete(reply);
          }
        });
      if (article.categories)
        article.categories.forEach(async (categoryId) => {
          let category = await Category.findOne({ _id: categoryId });
          if (!category) return;
          category.articles.pull(id);
          await category.save();
        });
      return { success: true, article };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // comments

  static async addComment(id, { comment, author }) {
    try {
      const article = await Article.findOne({ _id: id });
      if (!article) return { success: false, error: "Article  not found" };
      const commentDocument = new Comment({ comment });
      if (author) commentDocument.author = author;
      commentDocument.reply = [];
      await commentDocument.save();
      if (article.comments.length) article.comments.push(commentDocument._id);
      else article.comments = [commentDocument._id];
      await article.save();
      return { success: true, comment: commentDocument };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async deleteComment(id) {
    try {
      const comment = await Comment.findOne({ _id: id });
      if (!comment) return { success: false, error: "Comment not found" };
      comment.comment = "Deleted";
      await comment.save();
      return { success: true, comment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async updateComment(id, { vote, read, updatedComment }) {
    try {
      const comment = await Comment.findOne({ _id: id });
      if (!comment) return { success: false, error: "Comment not found" };
      if (vote) {
        vote = parseInt(vote) > 0 ? 1 : -1;
        comment.votes += vote;
      }
      if (updatedComment) comment.comment = updatedComment;
      if (read) comment.read = read;

      await comment.save();

      return { success: true, comment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async replyComment(id, { comment, author }) {
    try {
      const mainComment = await Comment.findOne({ _id: id });
      if (!mainComment) return { success: false, message: "Comment not found" };
      const commentDocument = new Comment({ comment, author });
      await commentDocument.save();
      mainComment.reply.push(commentDocument._id);
      await mainComment.save();
      return { success: true, comment: commentDocument };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getComment(id) {
    try {
      const comment = await Comment.findOne({ _id: id }).populate("reply");
      if (!Comment) return { succes: true, message: "Comment not found" };
      return { success: true, comment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async getComments({ count = 100, skip = 0, filter = {} }) {
    try {
      const comments = await Comment.find(filter)
        .populate("reply")
        .limit(100)
        .skip(skip * count);
      if (!comments) return { succes: true, error: "Comments not found" };
      return { success: true, comments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async addArticleImages(id, { image }) {
    try {
      const article = await Article.findOne({ _id: id });
      // article.images.push()
      return { success: true, article };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // categories

  static async getCategories({ skip = 0, count = 100 }) {
    try {
      const categories = await Category.find({})
        .limit(count)
        .skip(count * skip);
      if (!categories) return { success: false, error: "Categories not found" };
      return { success: true, categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async getCategory(id, { articles, skip = 0, count = 100 }) {
    try {
      let category;
      if (!articles) category = await Category.findOne({ _id: id });
      else
        category = await Category.findOne({ _id: id }).populate({
          path: "articles",
          options: { limit: count, skip: count * skip },
        });
      if (!category) return { success: false, error: "Category not found" };
      return { success: true, category };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async updateCategory(id, { title, description }) {
    try {
      const category = await Category.findOne({ _id: id });

      if (!category) return { success: false, error: "Category not found" };
      if (title)
        category.title = title[0].toUpperCase() + title.slice(1).toLowerCase();
      if (description) category.description = description;
      await category.save();
      return { success: true, category };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
