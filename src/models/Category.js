import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false, default: "" },
    articles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);
categorySchema.pre("validate", function validate() {
  this.title = this.title[0].toLowerCase() + this.title.slice(1).toLowerCase();
});
export default model("Category", categorySchema);

