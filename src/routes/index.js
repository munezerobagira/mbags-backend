import express from "express";
import { response } from "express";
import { SampleController } from "../controllers/";
import messageRoutes from "./message";
const router = express.Router();
router.get("/", (request, response) => {
  response.status(200).json({ message: "Welcome" });
});
router.use("/messages", messageRoutes);
router.use("*", SampleController.notFound);
export default router;
