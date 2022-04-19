import { ArticleServive } from "../services";
import { unlinkSync } from "fs";
export default class Article {
  static async addArticle(request, response) {
    try {
      if (!request.file)
        return response
          .status(400)
          .json({ status: 400, error: "Image required" });
      const { path: image } = request.file;

      const { title, images, summary, content, categories } = request.body;
      let { authorId } = request.body;
      if (!authorId) authorId = request.user._id;
      const result = await ArticleServive.addArticle({
        title,
        images,
        summary,
        content,
        categories,
        image,
        authorId,
      });
      unlinkSync(image);
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(201)
        .json({ status: 201, success: true, article: result.article });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async getArticles(request, response) {
    try {
      const { skip = 0, count = 100 } = request.query;
      const result = await ArticleServive.getArticles({ skip, count });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, articles: result.articles });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async getArticle(request, response) {
    try {
      const { id } = request.params;
      const result = await ArticleServive.getArticle(id);
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, article: result.article });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async addComment(request, response) {
    try {
      const { articleId } = request.params;
      let { comment, author } = request.body;
      if (!author) author = request.user._id;
      const result = await ArticleServive.addComment(articleId, {
        comment,
        author,
      });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(201)
        .json({ status: 201, success: true, comment: result.comment });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async deleteArticle(request, response) {
    try {
      const { id } = request.params;
      const result = await ArticleServive.deleteArticle(id);
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, comment: result.comment });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async updateArticle(request, response) {
    try {
      let image;
      if (request.file && request.file.path) image = request.file.path;
      const { id } = request.params;
      const { title, summary, content, categories, published, featured } =
        request.body;
      const result = await ArticleServive.updateArticle(id, {
        title,
        summary,
        content,
        categories,
        published,
        featured,
        image,
      });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, article: result.article });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
}
