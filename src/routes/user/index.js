import express from "express";
import profileRoutes from "./profile";

const router = express.Router();
router.use("/profile", profileRoutes);
export default router;
