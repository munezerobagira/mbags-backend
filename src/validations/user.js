import Joi from "joi";

const signup = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.ref("password"),
  username: Joi.string().required(),
});
const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
const profile = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  confirmPassword: Joi.ref("password"),
  username: Joi.string(),
  summary: Joi.string(),
  keywords: Joi.string(),
  info: Joi.string(),
  about: Joi.string(),
}).with("password", "confirmPassword");
const passwordReset = Joi.object({
  password: Joi.string(),
  confirmPassword: Joi.ref("password"),
}).with("password", "confirmPassword");
const id = Joi.object({
  id: Joi.string().required(),
});
export default {
  signup,
  profile,
  login,
  passwordReset,
  id,
};

