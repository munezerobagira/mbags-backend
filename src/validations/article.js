import Joi from "joi";

const createArticle = Joi.object({
  title: Joi.string().required(),
  summary: Joi.string().required(),
  content: Joi.string().required(),
  categories: Joi.string().default("blog"),
  image: Joi.any(),
  slug: Joi.string(),
});
const updateArticle = Joi.object({
  title: Joi.string(),
  summary: Joi.string(),
  content: Joi.string(),
  categories: Joi.string(),
  featured: Joi.boolean(),
  slug: Joi.string(),
  star: Joi.number().min(-1).max(1),
});
const updateCategory = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
});
const filter = Joi.object({
  featured: Joi.boolean(),
  title: Joi.string(),
  skip: Joi.number(),
  count: Joi.number(),
});
export default {
  createArticle,
  updateArticle,
  updateCategory,
  filter,
};

