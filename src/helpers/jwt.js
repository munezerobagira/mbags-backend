import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { tokenSecret } from "../config";
import { User } from "../models";

export const signToken = async (payload, options) =>
  jwt.sign(payload, tokenSecret, options);

export const verifyAuthToken = async (token) => {
  const payload = await jwt.verify(token, tokenSecret);
  const { user } = payload;
  const fetchedUser = await User.findOne({ _id: user._id, tokens: token });
  if (!fetchedUser) throw new JsonWebTokenError("Invalid token");
  return fetchedUser;
};
