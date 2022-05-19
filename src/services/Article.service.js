import { cloudinaryFolders } from "../config";
import { cloudinaryUploader } from "../helpers/uploader";
import { Article, Category, Comment } from "../models";

export default class ArticleService {
  // Articles
  static async addArticle({
    title,
    summary,
    categories,
    content,
    author,
    image,
  }) {
    const uploadResult = await cloudinaryUploader(
      image,
      cloudinaryFolders.articles
    );
    if (!uploadResult) return { succes: false, error: "Image upload error" };
    const article = new Article({
      title,
      summary,
      content,
      author,
      image: {
        path: uploadResult.secure_url || uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });
    await article.save();
    if (categories) {
      const tags = categories.split(",").map((tag) => tag.trim());
      for (let tag of tags) {
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
  }

  static async updateArticle(
    id,
    { title, summary, categories, content, featured, published, image }
  ) {
    let uploadResult = null;
    if (image)
      uploadResult = await cloudinaryUploader(
        image,
        cloudinaryFolders.articles
      );
    const article = await Article.findOne({ _id: id });
    if (title) article.title = title;
    if (summary) article.summary = summary;
    if (content) article.content = content;
    if (published) article.published = !!published;
    if (featured) article.featured = !!featured;
    if (uploadResult)
      article.image = {
        path: uploadResult.secure_url || uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height,
      };
    if (categories) {
      article.categories.forEach(async (categoryId) => {
        const category = await Category.findOne({ _id: categoryId });
        if (!category) return;
        category.articles.pull(id);
        await category.save();
      });
      article.categories = [];
      await article.save();
      const tags = categories.split(",").map((tag) => tag.trim());
      for (let tag of tags) {
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
  }

  static async getArticles({ count = 100, skip = 0, filter = {} }) {
    const articles = await Article.find(filter)
      .populate([
        {
          path: "categories",
          select: "title",
        },
      ])
      .limit(count)
      .skip(count * skip);
    if (!articles) return { success: false, error: "Articles not found" };
    return { success: true, articles };
  }

  static async getArticle(id) {
    const article = await Article.findOne({ _id: id }).populate([
      {
        path: "author",
        select: "name",
      },
      {
        path: "comments",
      },
      {
        path: "categories",
        select: "title",
      },
    ]);
    if (!article) return { success: false, error: "Article not found" };
    return { success: true, article };
  }

  static async deleteArticle(id) {
    const article = await Article.findOneAndDelete({ _id: id });
    if (!article) return { success: false, error: "Article not found" };
    if (article.comments)
      article.comments.forEach(async (commentId) => {
        await Comment.findOneAndDelete(commentId);
      });
    if (article.categories)
      article.categories.forEach(async (categoryId) => {
        const category = await Category.findOne({ _id: categoryId });
        if (!category) return;
        category.articles.pull(id);
        await category.save();
      });
    return { success: true, article };
  }
  // comments

  static async addComment(id, { comment, author }) {
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
  }

  static async deleteComment(id) {
    const comment = await Comment.findOneAndUpdate(
      { _id: id },
      { comment: "Comment was deleted" }
    );
    if (!comment.reply.length) await Comment.findOneAndDelete({ _id: id });
    if (!comment) return { success: false, error: "Comment not found" };
    return { success: true, comment };
  }

  static async updateComment(id, { vote, read, updatedComment }) {
    const comment = await Comment.findOne({ _id: id });
    if (!comment) return { success: false, error: "Comment not found" };
    if (vote) {
      comment.votes += parseInt(vote, 10) > 0 ? 1 : -1;
    }
    if (updatedComment) comment.comment = updatedComment;
    if (read) comment.read = read;

    await comment.save();

    return { success: true, comment };
  }

  static async replyComment(id, { comment, author }) {
    const mainComment = await Comment.findOne({ _id: id });
    if (!mainComment) return { success: false, message: "Comment not found" };
    const commentDocument = new Comment({ comment, author });
    await commentDocument.save();
    mainComment.reply.push(commentDocument._id);
    await mainComment.save();
    return { success: true, comment: commentDocument };
  }

  static async getComment(id) {
    const comment = await Comment.findOne({ _id: id }).populate("reply");
    if (!Comment) return { succes: true, message: "Comment not found" };
    return { success: true, comment };
  }

  static async getComments({ count = 100, skip = 0, filter = {} }) {
    const comments = await Comment.find(filter)
      .populate("reply")
      .limit(100)
      .skip(skip * count);
    if (!comments) return { succes: true, error: "Comments not found" };
    return { success: true, comments };
  }
  // categories

  static async getCategories({ skip = 0, count = 100 }) {
    const categories = await Category.find({})
      .limit(count)
      .skip(count * skip);
    return { success: true, categories };
  }

  static async getCategory(id, { articles, skip = 0, count = 100 }) {
    let category;
    if (!articles) category = await Category.findOne({ _id: id });
    else
      category = await Category.findOne({ _id: id }).populate({
        path: "articles",
        options: { limit: count, skip: count * skip },
      });
    return { success: true, category };
  }

  static async updateCategory(id, { title, description }) {
    const category = await Category.findOne({ _id: id });
    if (title)
      category.title = title[0].toUpperCase() + title.slice(1).toLowerCase();
    if (description) category.description = description;
    await category.save();
    return { success: true, category };
  }
}

