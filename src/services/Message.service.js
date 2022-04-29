import Message from "../models/Message";

export default class MessageServive {
  static async addMessage({ name, subject, email, message: userMessage }) {
    const message = new Message({
      name,
      subject,
      email,
      message: userMessage,
    });
    await message.save();
    return { success: true, message };
  }

  static async getMessages({ count = 100, skip = 0, filter = {} }) {
    const messages = await Message.find(filter)
      .limit(count)
      .skip(count * skip);
    if (!messages) return { success: false, error: "Messages not found" };
    return { success: true, messages };
  }

  static async getAMessage(id) {
    const message = await Message.findOne({ _id: id });
    if (!message) return { success: false, error: "Message not found" };
    return { success: true, message };
  }

  static async updateMessage(id, { reply, read }) {
    const message = await Message.findOne({ _id: id });
    if (!message) return { success: false, error: "Message not found" };
    if (reply) message.reply.push(reply);
    if (read) message.read = read;
    await message.save();
    return { success: true, message };
  }

  static async deleteMessage(id) {
    const message = await Message.findOneAndDelete({ _id: id });
    if (!message) return { success: false, error: "Message not found" };
    return { success: true, message };
  }
}
