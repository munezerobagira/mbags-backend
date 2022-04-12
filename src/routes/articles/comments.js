import express from "express";
import { CommentController } from "../../controllers";
const router = express.Router();
router.get("/", CommentController.getComments);
router.get("/:id", CommentController.getComment);
router.patch("/:id", CommentController.updateComment);
router.post("/:id/reply", CommentController.replyComment);
router.delete("/:id", CommentController.deleteComment);
export default router;
