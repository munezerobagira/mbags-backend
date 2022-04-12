import { MessageServive } from "../services";
export default class Message {
  static async addMessage(request, response) {
    try {
      const { name, subject, email, message } = request.body;
      const result = await MessageServive.addMessage({
        name,
        subject,
        email,
        message,
      });
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(201)
        .json({ status: 201, success: true, message: result.message });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async fetchMessages(request, response) {
    try {
      const { count = 100, skip = 0, filter = {} } = request.query;
      const result = await MessageServive.getMessages({
        count,
        skip,
        filter,
      });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, messages: result.messages });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async fetchMessage(request, response) {
    try {
      const { id } = request.params;
      const result = await MessageServive.getAMessage(id);
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, message: result.message });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async deleteMessage(request, response) {
    try {
      const { id } = request.params;
      const result = await MessageServive.deleteMessage(id);
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, message: result.message });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async updateMessage(request, response) {
    try {
      const { id } = request.params;
      const { read, reply } = request.body;
      const result = await MessageServive.updateMessage(id, { read, reply });
      if (!result.success)
        return response.status(404).json({ status: 404, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, message: result.message });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
}
