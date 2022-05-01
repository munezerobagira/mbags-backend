import express from "express";
import profileRoutes from "./profile";

const router = express.Router();
router.get("/profile", profileRoutes);
export default router;
