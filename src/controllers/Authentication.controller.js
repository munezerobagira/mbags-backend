import { generatePasswordResetTemplate, sendEmail } from "../helpers/email";
import errorFormatter from "../helpers/errorFormatter";
import { signToken, verifyPasswordResetToken } from "../helpers/jwt";
import Logger from "../helpers/Logger";
import { User } from "../models";
import { UserServive } from "../services";

export default class Authentication {
  static async login(request, response) {
    try {
      const { email, password } = request.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password)))
        return response
          .status(400)
          .json({ status: 400, error: "Invalid credentials" });

      const id = user._id;

      const token = await signToken(
        { user: { _id: id, username: user.email } },
        { expiresIn: "12h" }
      );
      await UserServive.updateUser(user._id, {
        token: { type: 1, value: token },
      });
      return response.status(200).json({ status: 200, success: true, token });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response
        .status(formattedError.status)
        .json({ status: formattedError.status, error: formattedError.message });
    }
  }

  static async signout(request, response) {
    try {
      const { user } = request;
      const { token } = request;
      const result = await UserServive.updateUser(user._id, {
        token: { action: -1, value: token },
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

  static async passwordReset(request, response) {
    try {
      const { password } = request.body;
      const { token } = request.query;
      const user = verifyPasswordResetToken(token);
      const result = await UserServive.updateUser(user._id, {
        password,
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
      const { email } = request.body;
      const result = await UserServive.getUser({ email });
      const token = await signToken(
        { user: { _id: result.user._id } },
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
}
