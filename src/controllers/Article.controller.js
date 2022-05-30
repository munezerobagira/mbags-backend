import { unlinkSync } from "fs";
import slugify from "slugify";
import { ArticleService } from "../services";
import { createBanner } from "../helpers/bannerCreator";
import { uploadFolder } from "../config";
import Logger from "../helpers/Logger";
import errorFormatter from "../helpers/errorFormatter";

export default class Article {
  static async addArticle(request, response) {
    try {
      let image;
      if (!request.file)
        image = await createBanner(
          request.body?.title || "a blog tempelate banner",
          {
            inputPath: `${uploadFolder}/temp`,
          }
        );
      else image = request.file?.path;

      const { title, images, summary, content, categories } = request.body;
      let { slug } = request.body;
      if (slug) slug = slugify(slug);
      const author = request?.user?._id;
      const result = await ArticleService.addArticle({
        title,
        images,
        summary,
        content,
        categories,
        image,
        author,
        slug,
      });
      unlinkSync(image);
      return response
        .status(201)
        .json({ status: 201, success: true, article: result.article });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async getArticles(request, response) {
    try {
      // eslint-disable-next-line prefer-const
      let { skip = 0, count = 100, ...filter } = request.query;
      if (filter.title) filter.title = { $regex: filter.title, $options: "i" };
      const result = await ArticleService.getArticles({ skip, count, filter });
      return response
        .status(200)
        .json({ status: 200, success: true, articles: result.articles });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async getArticle(request, response) {
    try {
      const { id } = request.params;
      const result = await ArticleService.getArticle(id);
      return response
        .status(200)
        .json({ status: 200, success: true, article: result.article });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async addComment(request, response) {
    try {
      const { articleId } = request.params;
      const { comment } = request.body;
      const author = request?.user?._id;
      const result = await ArticleService.addComment(articleId, {
        comment,
        author,
      });
      return response
        .status(201)
        .json({ status: 201, success: true, comment: result.comment });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async deleteArticle(request, response) {
    try {
      const { id } = request.params;
      const { slug } = request.query;
      const result = await ArticleService.deleteArticle({ id, slug });
      return response
        .status(200)
        .json({ status: 200, success: true, comment: result.comment });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async updateArticle(request, response) {
    try {
      let image;
      if (request.file && request.file.path) image = request.file.path;
      const { id } = request.params;
      const { title, summary, content, categories, published, featured } =
        request.body;
      let { slug } = request.body;
      if (slug) slug = slugify(slug);
      const result = await ArticleService.updateArticle(id, {
        title,
        summary,
        content,
        categories,
        published,
        featured,
        image,
        slug,
      });
      return response
        .status(200)
        .json({ status: 200, success: true, article: result.article });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }
}

