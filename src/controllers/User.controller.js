import { UserServive } from "../services";
import { unlinkSync } from "fs";
export default class User {
  static async signup(request, response) {
    try {
      let profilePic;
      if (request.file && request.file.path) profilePic = request.file.path;

      const { name, username, password, confirmPassword, email } = request.body;
      if (password !== confirmPassword) {
        profilePic && unlinkSync(profilePic);
        return response
          .status(400)
          .json({ status: 400, error: "Passwords do not match" });
      }
      const result = await UserServive.signup({
        name,
        username,
        password,
        email,
        profilePic,
      });
      profilePic && unlinkSync(profilePic);
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(201)
        .json({ status: 201, success: true, user: result.user });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
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
      profilePic && unlinkSync(profilePic);
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async deleteUser(request, response) {
    try {
      const { _id: id } = request.user;
      const result = await UserServive.deleteUser(id);
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async getUser(request, response) {
    try {
      const { _id: id } = request.user;
      const result = await UserServive.getUser(id);
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, user: result.user });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
  static async getUsers(request, response) {
    try {
      if (!request.user)
        return request.status(401).json({ status: 401, error: "Unauthorized" });
      const { skip, count } = request.query;

      const result = await UserServive.getUsers({ skip, count });
      if (!result.success)
        return response.status(400).json({ status: 400, error: result.error });
      return response
        .status(200)
        .json({ status: 200, success: true, users: result.users });
    } catch (error) {
      response.status(500).json({ status: 500, error: error.message });
    }
  }
}
