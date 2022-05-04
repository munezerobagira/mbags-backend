import Joi from "joi";

const createProject = Joi.object({
  title: Joi.string().required(),
  summary: Joi.string().required(),
  link: Joi.string().required(),
  categories: Joi.string().default("blog"),
});
const updateProject = Joi.object({
  title: Joi.string(),
  summary: Joi.string(),
  link: Joi.string(),
  categories: Joi.string(),
  published: Joi.boolean(),
  featured: Joi.boolean(),
  star: Joi.number().min(-1).max(1),
});
const filter = Joi.object({
  featured: Joi.boolean(),
  published: Joi.boolean().default(true),
  title: Joi.string(),
  skip: Joi.number(),
  count: Joi.number(),
});
export default {
  filter,
  createProject,
  updateProject,
};
