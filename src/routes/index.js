import express from "express";
import { SampleController } from "../controllers";
import messageRoutes from "./message";
import articlesRoutes from "./articles";
import projectsRoutes from "./project";

import userRoutes from "./user";
import authRoutes from "./auth";
import { isLoggedIn } from "../middlewares/auth";

const router = express.Router();
router.get("/", (request, response) => {
  response.status(200).json({ message: "Welcome" });
});
router.use("/messages", messageRoutes);
router.use("/articles", isLoggedIn, articlesRoutes);
router.use("/projects", isLoggedIn, projectsRoutes);
router.use("/user", isLoggedIn, userRoutes);
router.use("/auth", authRoutes);
router.use("*", SampleController.notFound);
export default router;
