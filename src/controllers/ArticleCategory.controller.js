import { ArticleServive } from "../services";
export default class ArticleCategory {
  static async getCategories(request, response) {
    try {
      const { skip = 0, count = 100, filter = {} } = request.query;
      const result = await ArticleServive.getCategories({
        skip,
        count,
        filter,
      });
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, categories: result.categories });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async getCategory(request, response) {
    try {
      const { id } = request.params;
      const { articles, skip, count } = request.query;
      const result = await ArticleServive.getCategory(id, {
        articles,
        skip,
        count,
      });
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, category: result.category });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async updateCategory(request, response) {
    try {
      const { id } = request.params;
      const { title, description } = request.body;
      const result = await ArticleServive.updateCategory(id, {
        title,
        description,
      });
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, category: result.category });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
}
