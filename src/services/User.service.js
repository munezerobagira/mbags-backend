import { cloudinaryFolders } from "../config";
import { cloudinaryUploader } from "../helpers/uploader";
import { User } from "../models";
export default class UserServive {
  static async signup({ name, username, email, password, profilePic }) {
    try {
      let user;
      if (!profilePic)
        user = new User({
          name,
          username,
          email,
          password,
        });
      else {
        let uploadResult = await cloudinaryUploader(
          profilePic,
          cloudinaryFolders.profiles
        );
        user = new User({
          name,
          username,
          email,
          password,
          profilePic: {
            path: uploadResult.secure_url || uploadResult.url,
            width: uploadResult.width,
            height: uploadResult.height,
          },
        });
      }
      await user.save();
      return {
        success: true,
        user: Object.assign(user._doc, {
          password: undefined,
          tokens: undefined,
        }),
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  static async updateUser(
    id,
    {
      name = null,
      email = null,
      username = null,
      password = null,
      verified = null,
      keywords = null,
      summary = null,
      info = null,
      profilePic,
      token = null,
      star = null,
    }
  ) {
    try {
      const user = await User.findOne({ _id: id });
      if (!user)
        return {
          success: false,
          error: "User not found, you might need to login",
        };
      if (name) user.name = name;
      if (email) user.email = email;
      if (username) user.username = username;
      if (password) user.password = password;
      if (verified) user.verified = verified;
      if (keywords) user.keywords = keywords;
      if (summary) user.summary = summary;
      if (info) user.info = info;
      if (profilePic) {
        let uploadResult = await cloudinaryUploader(profilePic);
        user.profilePic = {
          path: uploadResult.path,
          width: uploadResult.width,
          height: uploadResult.height,
        };
      }
      if (token) {
        token.type > 0
          ? user.tokens.push(token.value)
          : user.tokens.pull(token.value);
      }
      if (star) user.star = star;
      await user.save();
      return {
        success: true,
        user: Object.assign(user._doc, {
          password: undefined,
          tokens: undefined,
        }),
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  static async deleteUser(id) {
    try {
      const user = await User.findOneAndDelete({ _id: id });
      if (!user)
        return {
          success: false,
          error: "User not found or you might need to login",
        };
      return { success: true, user };
    } catch (error) {
      return { error: error.message };
    }
  }
  static async getUser(id) {
    try {
      const userData = await User.findOne({ _id: id });
      if (!userData)
        return {
          success: false,
          error: "User not found or you might need to login",
        };
      let user = Object.assign({}, userData._doc, {
        password: undefined,
        tokens: undefined,
      });

      return { success: true, user };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getUsers({ skip = 0, count = 100, filter = {} }) {
    try {
      const users = await User.find(filter)
        .limit(count)
        .skip(skip * count);
      if (!users) return { success: false, error: "Users not found" };
      return { success: true, users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
