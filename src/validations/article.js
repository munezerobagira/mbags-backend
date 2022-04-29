import Joi from "joi";

const createArticle = Joi.object({
  title: Joi.string().required(),
  summary: Joi.string().required(),
  content: Joi.string().required(),
  categories: Joi.string().default("blog"),
  image: Joi.any(),
});
const updateArticle = Joi.object({
  title: Joi.string(),
  summary: Joi.string(),
  content: Joi.string(),
  categories: Joi.string(),
  published: Joi.boolean(),
  featured: Joi.boolean(),
  star: Joi.number().min(-1).max(1),
});
const updateCategory = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
});
export default {
  createArticle,
  updateArticle,
  updateCategory,
};
