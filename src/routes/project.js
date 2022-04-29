import express from "express";
import { ProjectController } from "../controllers";
import { joiValidator } from "../middlewares";
import { isLoggedIn } from "../middlewares/auth";
import { projectSchema } from "../validations";

const router = express.Router();
router.post(
  "/",
  isLoggedIn,
  joiValidator(projectSchema.createProject),
  ProjectController.addProject
);
router.get("/", ProjectController.getProjects);
router.get("/:id", ProjectController.getProject);
router.patch(
  "/:id",
  joiValidator(projectSchema.updateProject),
  isLoggedIn,
  ProjectController.updateProject
);
router.delete("/:id", isLoggedIn, ProjectController.deleteProject);
export default router;
