import express from "express";
import { ProjectController } from "../controllers";
import { multerUploader } from "../helpers/uploader";
import { joiValidator } from "../middlewares";
import { checkRole, isLoggedIn } from "../middlewares/auth";
import { projectSchema } from "../validations";

const router = express.Router();
router.get(
  "/",
  joiValidator(projectSchema.filter, "query"),
  ProjectController.getProjects
);

router.post(
  "/",
  multerUploader.single("image"),
  isLoggedIn,
  checkRole("admin"),
  joiValidator(projectSchema.createProject),
  ProjectController.addProject
);
router.get("/:id", ProjectController.getProject);
router.patch(
  "/:id",
  multerUploader.single("image"),
  isLoggedIn,
  checkRole("admin"),
  joiValidator(projectSchema.updateProject),
  ProjectController.updateProject
);
router.delete(
  "/:id",
  isLoggedIn,
  checkRole("admin"),
  ProjectController.deleteProject
);
export default router;

