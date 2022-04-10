import mongoose from "mongoose";
const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, required: true },
    votes: { type: Number, required: true, default: 0 },
    read: { type: Boolean, required: true, default: false },
    reply: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);
export default mongoose.model("Comment", commentSchema);
