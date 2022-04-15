import Joi from "joi";
const createArticle = Joi.object({
  title: Joi.string().required(),
  summary: Joi.string().email().required(),
  content: Joi.string().required(),
  categories: Joi.string().default("blog"),
});
const updateArticle = Joi.object({
  title: Joi.string(),
  summary: Joi.string().email(),
  content: Joi.string(),
  categories: Joi.string(),
  published: Joi.boolean(),
  featured: Joi.boolean(),
  star: Joi.number().min(-1).max(1),
});
export default {
  createArticle,
  updateArticle,
};
