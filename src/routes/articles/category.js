import express from "express";
import { ArticleCategoryController } from "../../controllers";
const router = express.Router();
router.get("/", ArticleCategoryController.getCategories);
router.get("/:id", ArticleCategoryController.getCategory);
router.patch("/:id", ArticleCategoryController.updateCategory);
export default router;
