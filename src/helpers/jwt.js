import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { resetSecret, tokenSecret, verificationSecret } from "../config";
import { User } from "../models";
import { NonVerifiedUserError } from "./Errors";

export const signToken = async (payload, secret, options) =>
  jwt.sign(payload, secret, options);

export const verifyAuthToken = async (token) => {
  const payload = await jwt.verify(token, tokenSecret);
  const { user } = payload;
  const fetchedUser = await User.findOne({ _id: user._id, tokens: token });
  if (!fetchedUser) throw new JsonWebTokenError("Invalid token");
  if (!fetchedUser || !fetchedUser.verified) throw new NonVerifiedUserError();
  return fetchedUser;
};
export const verifyPasswordResetToken = async (token) => {
  const payload = await jwt.verify(token, resetSecret);
  const { user } = payload;
  const fetchedUser = await User.findOne({ _id: user._id, tokens: token });
  if (!fetchedUser) throw new JsonWebTokenError("Invalid token");
  if (!fetchedUser.tokens.includes(token))
    throw new JsonWebTokenError("Invalid token");
  return fetchedUser;
};
export const verifyUserProfileToken = async (token) => {
  const payload = await jwt.verify(token, verificationSecret);
  const { user } = payload;
  const fetchedUser = await User.findOne({ _id: user._id, tokens: token });
  if (!fetchedUser) throw new JsonWebTokenError("Invalid token");
  return fetchedUser;
};
