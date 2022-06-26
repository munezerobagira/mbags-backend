/* eslint-disable func-names */
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: false },
    image: { path: String, height: Number, width: Number, info: String },
    summary: { type: String, required: true },
    link: { type: String, required: true },
    githubLink: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    published: { type: Boolean, required: true, default: false },
    featured: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);
projectSchema.post("init", function (doc) {
  this._object = doc;
});

projectSchema.pre("updateOne", (next) => {
  if (this.isModified("categories")) {
    this._doc.categories.forEach(async (categoryId) => {
      await this.model.findByIdAndUpdate(categoryId, {
        $pull: { projects: this._id },
      });
    });
  }
  next();
});
export default mongoose.model("Project", projectSchema);

