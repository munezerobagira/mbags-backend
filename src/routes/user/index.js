import express from "express";
import { UserController } from "../../controllers";
import profileRoutes from "./profile";

const router = express.Router();
router.use("/profile", profileRoutes);
router.get("/", UserController.getOwnerInfo);
export default router;

