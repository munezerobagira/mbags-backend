import errorFormatter from "../helpers/errorFormatter";
import Logger from "../helpers/Logger";
import { ArticleServive } from "../services";

export default class Comment {
  static async getComment(request, response) {
    try {
      const { id } = request.params;
      const result = await ArticleServive.getComment(id);
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
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async getComments(request, response) {
    try {
      const { count = 100, skip = 0, ...filter } = request.query;
      const result = await ArticleServive.getComments({ count, skip, filter });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, comments: result.comments });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async updateComment(request, response) {
    try {
      const { comment, read, vote } = request.body;
      const { id } = request.params;
      const result = await ArticleServive.updateComment(id, {
        read,
        updatedComment: comment,
        vote,
      });
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
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async deleteComment(request, response) {
    try {
      const { id } = request.params;
      const result = await ArticleServive.deleteComment(id);
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, comments: result.comment });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async replyComment(request, response) {
    try {
      const { comment } = request.body;
      const { id } = request.params;
      const result = await ArticleServive.replyComment(id, { comment });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(201)
        .json({ status: 201, success: true, comments: result.comment });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }
}
