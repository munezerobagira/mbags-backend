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

      const { title, images, summary, link, categories, githubLink } =
        request.body;
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
        githubLink,
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
      const { skip = 0, count = 100, ...filter } = request.query;
      if (filter.title) filter.title = { $regex: filter.title, $options: "i" };
      const result = await ProjectServive.getProjects({ skip, count, filter });
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
}

