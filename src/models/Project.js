import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: false },
    image: { path: String, height: Number, width: Number, info: String },
    summary: { type: String, required: true },
    link: { type: String, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    published: { type: Boolean, required: true, default: false },
    featured: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);
export default mongoose.model("Project", projectSchema);

