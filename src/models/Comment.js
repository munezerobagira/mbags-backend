import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, required: true },
    votes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        vote: { type: Number, default: 0, max: 3, min: -3 },
      },
    ],
    read: { type: Boolean, required: true, default: false },
    reply: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);
// eslint-disable-next-line func-names
const populateComment = function (next) {
  this.populate("reply");
  this.populate({ path: "author", select: "name" });
  next();
};

commentSchema.pre("findOne", populateComment).pre("find", populateComment);
export default mongoose.model("Comment", commentSchema);

