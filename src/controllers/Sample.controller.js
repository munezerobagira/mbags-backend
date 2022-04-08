export default class Sample {
  static async notFound(request, response) {
    response.status(404).json({ status: 404, messages: "Page not found" });
  }
}
