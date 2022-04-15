import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true, default: "A message" },
    message: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
    reply: [{ type: String }],
  },
  { timestamps: true }
);
export default mongoose.model("Message", messageSchema);
