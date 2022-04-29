import errorFormatter from "../helpers/errorFormatter";
import { signToken } from "../helpers/jwt";
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
}
