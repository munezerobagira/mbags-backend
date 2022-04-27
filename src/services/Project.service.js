import { cloudinaryFolders } from "../config";
import { cloudinaryUploader } from "../helpers/uploader";
import { Project, Category } from "../models";

export default class ArticleServive {
  // Articles
  static async addProject({ title, summary, categories, link, image }) {
    try {
      let uploadResult;
      if (image)
        uploadResult = await cloudinaryUploader(
          image,
          cloudinaryFolders.projects
        );
      const project = new Project({
        title,
        summary,
        link,
        images: uploadResult && [
          {
            path: uploadResult.secure_url || uploadResult.url,
            width: uploadResult.width,
            height: uploadResult.height,
          },
        ],
      });
      await project.save();
      if (categories) {
        const tags = categories.split(",").map((tag) => tag.trim());
        for (let tag of tags) {
          tag = tag[0].toUpperCase() + tag.slice(1).toLowerCase();
          let category = await Category.findOne({ title: tag });
          if (!category)
            category = new Category({ title: tag, articles: [], projects: [] });
          category.projects.push(project._id);
          await category.save();
          project.categories.push(category._id);
        }
        await project.save();
      }
      return { success: true, project };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async updateProject(
    id,
    { title, summary, categories, link, featured, published }
  ) {
    try {
      const project = await Project.findOne({ _id: id });
      if (!project) return { success: false, error: "Project not found" };
      if (title) project.title = title;
      if (summary) project.summary = summary;
      if (link) project.link = link;
      if (published) project.published = !!published;
      if (featured) project.featured = !!featured;
      if (categories) {
        project.categories.forEach(async (categoryId) => {
          const category = await Category.findOne({ _id: categoryId });
          if (!category) return;
          category.projects.pull(id);
          await category.save();
        });
        project.categories = [];
        await project.save();
        const tags = categories.split(",").map((tag) => tag.trim());
        for (let tag of tags) {
          tag = tag[0].toUpperCase() + tag.slice(1).toLowerCase();
          let category = await Category.findOne({ title: tag });
          if (!category) category = new Category({ title: tag, projects: [] });
          if (!category.projects.includes(project._id))
            category.projects.push(project._id);
          await category.save();
          project.categories.push(category._id);
        }
        await project.save();
      }

      await project.save();
      return { success: true, project };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getProjects({ count = 100, skip = 0, filter = {} }) {
    try {
      const projects = await Project.find(filter)
        .limit(count)
        .skip(count * skip);
      if (!projects) return { success: false, error: "projects not found" };
      return { success: true, projects };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getProject(id) {
    try {
      const project = await Project.findOne({ _id: id }).populate({
        path: "categories",
        options: { select: "title" },
      });
      if (!project) return { success: false, error: "Project not found" };
      return { success: true, project };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async deleteProject(id) {
    try {
      const project = await Project.findOneAndDelete({ _id: id });
      if (!project) return { success: false, error: "Project not found" };
      if (project.categories)
        project.categories.forEach(async (categoryId) => {
          const category = await Category.findOne({ _id: categoryId });
          if (!category) return;
          category.articles.pull(id);
          await category.save();
        });
      return { success: true, project };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
