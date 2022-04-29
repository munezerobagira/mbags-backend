import express from "express";
import { CommentController } from "../../controllers";
import { joiValidator } from "../../middlewares";
import { isLoggedIn } from "../../middlewares/auth";
import { commentSchema } from "../../validations";

const router = express.Router();
router.get("/", CommentController.getComments);
router.get("/:id", CommentController.getComment);
router.patch(
  "/:id",
  isLoggedIn,
  joiValidator(commentSchema.updateComment),
  CommentController.updateComment
);
router.post("/:id/reply", isLoggedIn, CommentController.replyComment);
router.delete("/:id", isLoggedIn, CommentController.deleteComment);
export default router;
