import errorFormatter from "../helpers/errorFormatter";
import { signToken } from "../helpers/jwt";
import Logger from "../helpers/Logger";
import { UserServive } from "../services";

export default class Authentication {
  static async login(request, response) {
    try {
      const { user } = request;
      const id = user._id;
      if (!user)
        return response
          .status(400)
          .json({ status: 400, error: "You must login" });

      const token = await signToken(
        { user: { _id: id, username: user.email } },
        { expiresIn: "12h" }
      );
      const result = await UserServive.updateUser(user._id, {
        token: { type: 1, value: token },
      });
      if (!result.success)
        return response
          .status(400)
          .json({ status: 400, success: true, error: result.error });
      return response.status(200).json({ status: 200, success: true, token });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error(error.stack);
      return response
        .status(formattedError.status)
        .json({ status: 500, error: formattedError.message });
    }
  }

  static async signout(request, response) {
    try {
      const { user } = request;
      const { token } = request;
      const result = await UserServive.updateUser(user._id, {
        token: { action: -1, value: token },
      });
      if (!result.success)
        return response
          .status(400)
          .json({ status: 400, success: true, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user, token });
    } catch (error) {
      const formattedError = errorFormatter(error);
      Logger.error();
      return response
        .status(formattedError.status)
        .json({ status: 500, error: formattedError.message });
    }
  }
}
