import mongoose from "mongoose";
import { hash, compare } from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    keywords: { type: String },
    summary: { type: String },
    info: { type: String },
    profilePic: {
      path: String,
      width: String,
      height: String,
    },
    star: { type: Number, default: 0 },
    tokens: [{ type: String }],
    role: {
      type: String,
      required: true,
      default: "guest",
      enum: ["admin", "guest"],
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function presave(next) {
  if (!this.isModified("password")) return next();
  this.password = await hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(password) {
  const result = await compare(password, this.password);
  return result;
};
const User = mongoose.model("User", userSchema);

export async function createUser({
  name = "Super User",
  email = "admin@sosteneprotofolio@gmail.com",
  username = "admin",
  password = "admin",
  role = "admin",
}) {
  const createdUser = await User.create({
    name,
    email,
    username,
    role,
    password,
  });
  return createdUser._doc;
}

export default User;
