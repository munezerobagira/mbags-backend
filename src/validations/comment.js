import Joi from "joi";
const createComment = Joi.object({
  comment: Joi.string().required(),
});
const updateComment = Joi.object({
  comment: Joi.string().required(),
  votes: Joi.number().valid(-1, 1),
  read: Joi.boolean(),
  reply: Joi.boolean(),
});
export default {
  createComment,
  updateComment,
};
