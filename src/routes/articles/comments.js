import express from "express";
import { CommentController } from "../../controllers";
import { joiValidator } from "../../middlewares";
import { commentSchema } from "../../validations";
const router = express.Router();
router.get("/", CommentController.getComments);
router.get("/:id", CommentController.getComment);
router.patch(
  "/:id",
  joiValidator(commentSchema.updateComment),
  CommentController.updateComment
);
router.post("/:id/reply", CommentController.replyComment);
router.delete("/:id", CommentController.deleteComment);
export default router;
