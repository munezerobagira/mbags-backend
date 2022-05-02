import { unlinkSync } from "fs";
import { UserServive } from "../services";
import {
  generatePasswordResetTemplate,
  generateVerifyTemplate,
  sendEmail,
} from "../helpers/email";
import Logger from "../helpers/Logger";
import errorFormatter from "../helpers/errorFormatter";
import {
  signToken,
  verifyPasswordResetToken,
  verifyUserProfileToken,
} from "../helpers/jwt";
import { resetSecret, verificationSecret } from "../config";

export default class User {
  static async signup(request, response) {
    try {
      const { name, username, password, email } = request.body;
      const result = await UserServive.signup({
        name,
        username,
        password,
        email,
      });
      return response
        .status(201)
        .json({ status: 201, success: true, user: result.user });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async updateUser(request, response) {
    try {
      let profilePic;
      if (request.file) profilePic = request.file.path;
      const { name, username, keywords, summary, info, email, verified } =
        request.body;
      const { _id: id } = request.user;
      const result = await UserServive.updateUser(id, {
        name,
        username,
        keywords,
        summary,
        info,
        email,
        verified,
      });
      if (profilePic) unlinkSync(profilePic);
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user });
    } catch (error) {
      Logger.error(error.stack);
      return response.status(500).json({ status: 500, error: error.message });
    }
  }

  static async deleteUser(request, response) {
    try {
      const { _id: id } = request.user;
      const result = await UserServive.deleteUser(id);
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError, error: formattedError.message });
    }
  }

  static async getUser(request, response) {
    try {
      const { _id: id } = request.user;
      const result = await UserServive.getUser({ id });
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError, error: formattedError.message });
    }
  }

  static async getUsers(request, response) {
    try {
      if (!request.user)
        return request.status(401).json({ status: 401, error: "Unauthorized" });
      const { skip, count } = request.query;

      const result = await UserServive.getUsers({ skip, count });
      return response
        .status(200)
        .json({ status: 200, success: true, users: result.users });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(formattedError.error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError, error: formattedError.message });
    }
  }

  static async passwordReset(request, response) {
    try {
      const { password } = request.body;
      const { token } = request.query;
      const user = verifyPasswordResetToken(token);
      const result = await UserServive.updateUser(user._id, {
        password,
        token: { action: "remove", value: token },
      });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.error);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async getPasswordResetToken(request, response) {
    try {
      const { id } = request.body;
      const result = await UserServive.getUser({ _id: id });
      const token = await signToken(
        { user: { _id: result.user._id } },
        resetSecret,
        { expiresIn: 30 * 60 * 1000 }
      );
      const template = generatePasswordResetTemplate({
        name: result.user.name,
        email: result.user.email,
        token,
      });
      await sendEmail(template);
      result.user.token.push(token);
      await result.user.save();
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user, token });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.error);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async verifyProfile(request, response) {
    try {
      const { token } = request.query;
      if (!token)
        return response
          .status(400)
          .json({ status: 400, error: "Token is required" });
      const user = await verifyUserProfileToken(token);
      const result = await UserServive.verifyProfile(user.id);
      await UserServive.updateUser(result.user._id, {
        token: { action: "remove", value: token },
      });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user, token });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.error);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async getVerifyToken(request, response) {
    try {
      const { id } = request.query;
      const result = await UserServive.getUser({ _id: id, verified: false });
      if (!result.user)
        return response.status(400).json({ status: 400, error: result.error });
      const token = await signToken(
        { user: { id: result.user._id } },
        verificationSecret,
        {
          expiresIn: "12h",
        }
      );
      await UserServive.updateUser(result.user._id, {
        token: { action: "add", value: token },
      });
      const template = generateVerifyTemplate({
        name: result.user.name,
        email: result.user.email,
        token,
      });
      await sendEmail(template);
      return response.status(200).json({ status: 200, success: true });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.error);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }
}
