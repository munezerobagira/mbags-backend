import Joi from "joi";
const createMessage = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  message: Joi.string().required(),
  subject: Joi.string().default("Message"),
});
const updateMessage = Joi.object({
  read: Joi.boolean(),
  reply: Joi.string(),
});
export default {
  createMessage,
  updateMessage,
};
