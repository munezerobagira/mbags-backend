import express from "express";
import { ArticleController, CommentController } from "../../controllers";
import { multerUploader } from "../../helpers/uploader";
import { joiValidator } from "../../middlewares";
import { articleSchema, commentSchema } from "../../validations";
import categoryRoutes from "./category";
import commentsRoutes from "./comments";
const router = express.Router();
router.get("/", ArticleController.getArticles);
router.post(
  "/",
  joiValidator(articleSchema.updateArticle),
  multerUploader.single("image"),
  ArticleController.addArticle
);
router.use("/categories", categoryRoutes);
router.use("/comments", commentsRoutes);
router.get("/:id", ArticleController.getArticle);
router.delete("/:id", ArticleController.deleteArticle);
router.patch(
  "/:id",
  joiValidator(articleSchema.updateArticle),
  ArticleController.updateArticle
);
router.post(
  "/:articleId/comment",
  joiValidator(commentSchema.createComment),
  ArticleController.addComment
);
export default router;
