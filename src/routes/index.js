import express from "express";
import { SampleController, UserController } from "../controllers";
import messageRoutes from "./message";
import articlesRoutes from "./articles";
import projectsRoutes from "./project";

import userRoutes from "./user";
import authRoutes from "./auth";

const router = express.Router();
router.get("/", (request, response) => {
  response.status(200).json({ message: "Welcome" });
});
router.use("/messages", messageRoutes);
router.use("/articles", articlesRoutes);
router.use("/projects", projectsRoutes);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.get("/owner", UserController.getOwnerInfo);
router.use("*", SampleController.notFound);
export default router;

