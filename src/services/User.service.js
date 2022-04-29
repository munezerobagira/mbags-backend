import { cloudinaryFolders } from "../config";
import { cloudinaryUploader } from "../helpers/uploader";
import { User } from "../models";

export default class UserServive {
  static async signup({ name, username, email, password, profilePic }) {
    const user = new User({
      name,
      username,
      email,
      password,
    });
    await user.save();
    return {
      success: true,
      user: Object.assign(user._doc, {
        password: undefined,
        tokens: undefined,
      }),
    };
  }

  static async updateUser(
    id,
    {
      name = null,
      email = null,
      username = null,
      verified = null,
      keywords = null,
      summary = null,
      info = null,
      profilePic,
      token = null,
      star = null,
    }
  ) {
    const user = await User.findOne({ _id: id });
    if (!user)
      return {
        success: false,
        error: "User not found, you might need to login",
      };
    if (name) user.name = name;
    if (email) user.email = email;
    if (username) user.username = username;
    if (verified) user.verified = verified;
    if (keywords) user.keywords = keywords;
    if (summary) user.summary = summary;
    if (info) user.info = info;
    if (profilePic) {
      const uploadResult = await cloudinaryUploader(
        profilePic,
        cloudinaryFolders.profiles
      );
      user.profilePic = {
        path: uploadResult.path,
        width: uploadResult.width,
        height: uploadResult.height,
      };
    }
    if (token && token.type > 0) user.tokens.push(token.value);
    else user.tokens.pull(token.value);

    if (star) user.star = star;
    await user.save();
    return {
      success: true,
      user: Object.assign(user._doc, {
        password: undefined,
        tokens: undefined,
      }),
    };
  }

  static async deleteUser(id) {
    const user = await User.findOneAndDelete({ _id: id });
    if (!user)
      return {
        success: false,
        error: "User not found or you might need to login",
      };
    return { success: true, user };
  }

  static async getUser(id) {
    const userData = await User.findOne({ _id: id });
    if (!userData)
      return {
        success: false,
        error: "User not found or you might need to login",
      };
    const user = { ...userData._doc, password: undefined };

    return { success: true, user };
  }

  static async getUsers({ skip = 0, count = 100, filter = {} }) {
    const users = await User.find(filter)
      .limit(count)
      .skip(skip * count);
    if (!users) return { success: false, error: "Users not found" };
    return { success: true, users };
  }

  static async changePassword(
    id,
    { password, oldPassword, withToken = false }
  ) {
    const user = await User.findOne({ _id: id });
    if (!oldPassword && !withToken) throw new Error("Token or password needed");
    if (user.comparePassword(oldPassword)) this.password = password;
    await user.save();
    return {
      success: true,
      user: Object.assign(user._doc, {
        password: undefined,
        tokens: undefined,
      }),
    };
  }
}
