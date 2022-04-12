import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);
userSchema.virtual("comments", {
  ref: "Comment",
  localField: "comments",
  foreignField: "_id",
  justOne: false,
});
export default mongoose.model("User", userSchema);
