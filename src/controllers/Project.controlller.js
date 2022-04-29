import { unlinkSync } from "fs";

import { ProjectServive } from "../services";
import { createBanner } from "../helpers/bannerCreator";
import { uploadFolder } from "../config";
import Logger from "../helpers/Logger";
import errorFormatter from "../helpers/errorFormatter";

export default class Article {
  static async addProject(request, response) {
    try {
      let image;
      if (!request.file)
        image = await createBanner(
          request.body?.title || "This image for project",
          {
            inputPath: `${uploadFolder}/temp`,
          }
        );
      if (request.file) image = request.file?.path;

      const { title, images, summary, link, categories } = request.body;
      let { _id: authorId } = request.user;
      if (!authorId) authorId = request.user._id;
      const result = await ProjectServive.addProject({
        title,
        images,
        summary,
        link,
        categories,
        image,
        authorId,
      });
      if (image) unlinkSync(image);
      return response
        .status(201)
        .json({ status: 201, success: true, project: result.project });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async getProjects(request, response) {
    try {
      const { skip = 0, count = 100 } = request.query;
      const result = await ProjectServive.getProjects({ skip, count });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, projects: result.projects });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async getProject(request, response) {
    try {
      const { id } = request.params;
      const result = await ProjectServive.getProject(id);
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, project: result.project });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async deleteProject(request, response) {
    try {
      const { id } = request.params;
      const result = await ProjectServive.deleteProject(id);
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, comment: result.comment });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }

  static async updateProject(request, response) {
    try {
      let image;
      if (request.file && request.file.path) image = request.file.path;
      const { id } = request.params;
      const { title, summary, link, categories, published, featured } =
        request.body;
      const result = await ProjectServive.updateProject(id, {
        title,
        summary,
        link,
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
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json(formattedError.message);
    }
  }
}
