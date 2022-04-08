import express from "express";
import { MessageController } from "../controllers";
const router = express.Router();
router.get("/", MessageController.fetchMessages);
router.post("/", MessageController.addMessage);
router.get("/:id", MessageController.fetchMessage);
router.patch("/:id", MessageController.updateMessage);
router.delete("/:id", MessageController.deleteMessage);
export default router;
