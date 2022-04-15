import Message from "../models/Message";
export default class MessageServive {
  static async addMessage({ name, subject, email, message: userMessage }) {
    try {
      const message = new Message({
        name,
        subject,
        email,
        message: userMessage,
      });
      await message.save();
      return { success: true, message };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getMessages({ count = 100, skip = 0, filter = {} }) {
    try {
      const messages = await Message.find(filter)
        .limit(count)
        .skip(count * skip);
      if (!messages) return { success: false, error: "Messages not found" };
      return { success: true, messages };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async getAMessage(id) {
    try {
      const message = await Message.findOne({ _id: id });
      if (!message) return { success: false, error: "Message not found" };
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async updateMessage(id, { reply, read }) {
    try {
      const message = await Message.findOne({ _id: id });
      if (!message) return { success: false, error: "Message not found" };
      if (reply) message.reply.push(reply);
      if (read) message.read = read;
      await message.save();
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  static async deleteMessage(id) {
    try {
      const message = await Message.findOneAndDelete({ _id: id });
      if (!message) return { success: false, error: "Message not found" };
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
