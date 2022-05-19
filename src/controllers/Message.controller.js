import errorFormatter from "../helpers/errorFormatter";
import Logger from "../helpers/Logger";
import { MessageService } from "../services";

export default class Message {
  static async addMessage(request, response) {
    try {
      const { name, subject, email, message } = request.body;
      const result = await MessageService.addMessage({
        name,
        subject,
        email,
        message,
      });
      return response
        .status(201)
        .json({ status: 201, success: true, message: result.message });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async fetchMessages(request, response) {
    try {
      const { count = 100, skip = 0, filter = {} } = request.query;
      const result = await MessageService.getMessages({
        count,
        skip,
        filter,
      });
      return response
        .status(200)
        .json({ status: 200, success: true, messages: result.messages });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async fetchMessage(request, response) {
    try {
      const { id } = request.params;
      const result = await MessageService.getAMessage(id);
      return response
        .status(200)
        .json({ status: 200, success: true, message: result.message });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async deleteMessage(request, response) {
    try {
      const { id } = request.params;
      const result = await MessageService.deleteMessage(id);
      return response
        .status(200)
        .json({ status: 200, success: true, message: result.message });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async updateMessage(request, response) {
    try {
      const { id } = request.params;
      const { read, reply } = request.body;
      const result = await MessageService.updateMessage(id, { read, reply });
      return response
        .status(200)
        .json({ status: 200, success: true, message: result.message });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }
}

