import express from "express";
import { SampleController } from "../controllers/";
import messageRoutes from "./message";
import articlesRoutes from "./articles";
const router = express.Router();
router.get("/", (request, response) => {
  response.status(200).json({ message: "Welcome" });
});
router.use("/messages", messageRoutes);
router.use("/articles", articlesRoutes);
router.use("*", SampleController.notFound);
export default router;
