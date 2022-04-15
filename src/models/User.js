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
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};
export default mongoose.model("User", userSchema);
