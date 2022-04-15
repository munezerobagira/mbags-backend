import { signToken } from "../helpers/jwt";
import { UserServive } from "../services";
export default class Authentication {
  static async login(request, response) {
    try {
      const { user } = request;
      if (!user)
        return response
          .status(400)
          .json({ status: 400, error: "You must login" });

      const token = await signToken(
        { user: { _id: user._id, username: user.email } },
        { expiresIn: "12h" }
      );
      const result = await UserServive.updateUser(user._id, {
        token: { type: 1, value: token },
      });
      if (!result.success)
        return response
          .status(400)
          .json({ status: 400, success: true, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user, token });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async logout(request, response) {
    try {
      const { user } = request;
      const { token } = request;
      if (!user)
        return response
          .status(403)
          .json({ status: 403, error: "Unauthorized" });

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
      response.status(500).json({ status: 500, error: error.message });
    }
  }
}
