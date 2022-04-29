import express from "express";
import { ArticleCategoryController } from "../../controllers";
import { joiValidator } from "../../middlewares";
import { checkRole, isLoggedIn } from "../../middlewares/auth";
import { articleSchema } from "../../validations";

const router = express.Router();
router.get("/", ArticleCategoryController.getCategories);
router.get("/:id", ArticleCategoryController.getCategory);
router.patch(
  "/:id",
  isLoggedIn,
  joiValidator(articleSchema.updateCategory),
  checkRole("admin"),
  ArticleCategoryController.updateCategory
);
export default router;
