import { tokenSecret } from "../config";
import jwt from "jsonwebtoken";
import { User } from "../models";
export const signToken = async function (payload, options) {
  try {
    return await jwt.sign(payload, tokenSecret, options);
  } catch (error) {}
};

export const verifyAuthToken = async function (token) {
  const payload = await jwt.verify(token, tokenSecret);
  const { user } = payload;
  const fetchedUser = await User.findOne({ _id: user._id, tokens: token });
  if (!fetchedUser) throw Error("Invalid token");
  return fetchedUser;
};
