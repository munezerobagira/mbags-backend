import { Schema, model } from "mongoose";
const categorySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false, default: "" },
    articles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  },
  { timestamps: true }
);
categorySchema.pre("validate", function () {
  this.title = this.title[0].toLowerCase() + this.title.slice(1).toLowerCase();
});
export default model("Category", categorySchema);
