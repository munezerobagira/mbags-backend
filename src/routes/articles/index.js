import express from "express";
import { ArticleController } from "../../controllers";
import { multerUploader } from "../../helpers/uploader";
import { joiValidator } from "../../middlewares";
import { checkRole, isLoggedIn } from "../../middlewares/auth";
import { articleSchema, commentSchema } from "../../validations";
import categoryRoutes from "./category";
import commentsRoutes from "./comments";

const router = express.Router();
router.get("/", ArticleController.getArticles);
router.post(
  "/",
  isLoggedIn,
  multerUploader.single("image"),
  joiValidator(articleSchema.createArticle),
  checkRole("admin"),
  ArticleController.addArticle
);
router.use("/categories", categoryRoutes);
router.use("/comments", commentsRoutes);
router.get("/:id", ArticleController.getArticle);
router.delete(
  "/:id",
  isLoggedIn,
  checkRole("admin"),
  ArticleController.deleteArticle
);
router.patch(
  "/:id",
  multerUploader.single("image"),
  joiValidator(articleSchema.updateArticle),
  isLoggedIn,
  checkRole("admin"),
  ArticleController.updateArticle
);
router.post(
  "/:articleId/comment",
  isLoggedIn,
  joiValidator(commentSchema.createComment),
  ArticleController.addComment
);
export default router;
